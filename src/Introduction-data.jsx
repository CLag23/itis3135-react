import { useEffect, useState } from 'react';

const API_BASE = 'https://dvonb.xyz/api/2025-fall/itis-3135/students/';
const PAGE_SIZE = 15;

function getFullName(student) {
  if (!student?.name) return '';
  const { preferred, first, middleInitial, last } = student.name;
  const parts = [preferred || first, middleInitial, last].filter(Boolean);
  return parts.join(' ');
}

function CourseList({ courses }) {
  if (!courses?.length) return null;
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.code || `${course.dept}-${course.num}`}>
          <strong>{course.dept} {course.num}</strong> - {course.name}
          {course.reason ? ` (${course.reason})` : ''}
        </li>
      ))}
    </ul>
  );
}

function Backgrounds({ backgrounds }) {
  if (!backgrounds) return null;
  const { personal, professional, academic, subject } = backgrounds;
  return (
    <>
      {personal && (
        <>
          <h3>Personal Background</h3>
          <p>{personal}</p>
        </>
      )}
      {professional && (
        <>
          <h3>Professional Background</h3>
          <p>{professional}</p>
        </>
      )}
      {academic && (
        <>
          <h3>Academic Background</h3>
          <p>{academic}</p>
        </>
      )}
      {subject && (
        <>
          <h3>Background in the Subject</h3>
          <p>{subject}</p>
        </>
      )}
    </>
  );
}

function Links({ links, divider }) {
  if (!links) return null;
  const entries = Object.entries(links).filter(([, url]) => url);
  if (!entries.length) return null;
  const dividerText = ` ${divider} `;

  return (
    <p>
      {entries.map(([key, url], index) => (
        <span key={key}>
          <a href={url} target="_blank" rel="noreferrer">{key}</a>
          {index < entries.length - 1 ? dividerText : ''}
        </span>
      ))}
    </p>
  );
}

export default function IntroductionData() {
  const [prefix, setPrefix] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prefixes, setPrefixes] = useState([]);
  const [page, setPage] = useState(0);
  const [prefixError, setPrefixError] = useState('');

  useEffect(() => {
    document.title = "Carl's Laguerre Introduction Data";

    const loadPrefixes = async () => {
      try {
        const resp = await fetch(API_BASE);
        if (!resp.ok) throw new Error('Unable to load prefixes.');
        const data = await resp.json();
        if (Array.isArray(data)) {
          const uniquePrefixes = [...new Set(data.map((item) => item.prefix).filter(Boolean))];
          setPrefixes(uniquePrefixes);
        } else {
          setPrefixError('No prefix list available.');
        }
      } catch (err) {
        setPrefixError('Unable to load prefix list.');
      }
    };

    loadPrefixes();
  }, []);

  const runSearch = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Enter an email prefix to search.');
      setStudent(null);
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);

    try {
      const response = await fetch(`${API_BASE}${encodeURIComponent(trimmed)}`);
      if (!response.ok) {
        throw new Error('No student found for that prefix.');
      }
      const data = await response.json();
      const normalized = Array.isArray(data) ? data[0] : data;
      if (!normalized) {
        throw new Error('No student found for that prefix.');
      }
      setStudent(normalized);
    } catch (err) {
      setError(err.message || 'Unable to fetch student data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await runSearch(prefix);
  };

  const handlePrefixClick = async (value) => {
    setPrefix(value);
    await runSearch(value);
  };

  const totalPages = Math.ceil(prefixes.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = prefixes.slice(start, end);

  const renderStudent = () => {
    if (!student) return null;
    const divider = student.divider || '|';
    const name = getFullName(student);
    const titleParts = [name || 'Student', student.mascot].filter(Boolean);
    const media = student.media;
    const imageSrc = media?.src
      ? (media.src.startsWith('http') ? media.src : `https://dvonb.xyz${media.src}`)
      : '';
    const showImage = media?.hasImage && imageSrc;

    return (
      <article>
        <h2>{titleParts.join(` ${divider} `)}</h2>
        {student.acknowledgement && (
          <p><strong>Acknowledgement:</strong> {student.acknowledgement}</p>
        )}

        {showImage && (
          <figure>
            <img src={imageSrc} alt={media.caption || name || 'Student'} style={{ maxWidth: '320px', height: 'auto' }} />
            {media.caption && <figcaption>{media.caption}</figcaption>}
          </figure>
        )}

        <Backgrounds backgrounds={student.backgrounds} />

        {student.courses?.length ? (
          <>
            <h3>Courses</h3>
            <CourseList courses={student.courses} />
          </>
        ) : null}

        {student.personalStatement && (
          <>
            <h3>Personal Statement</h3>
            <p>{student.personalStatement}</p>
          </>
        )}

        {student.quote?.text && (
          <p><strong>Quote:</strong> {student.quote.text}{student.quote.author ? ` - ${student.quote.author}` : ''}</p>
        )}

        {student.funFact && <p><strong>Fun Fact:</strong> {student.funFact}</p>}

        {student.links ? (
          <>
            <h3>Links</h3>
            <Links links={student.links} divider={divider} />
          </>
        ) : null}
      </article>
    );
  };

  return (
    <section>
      <h2>Introduction JSON Data</h2>
      <form onSubmit={handleSearch}>
        <label htmlFor="prefix">Email prefix</label>
        <input
          id="prefix"
          name="prefix"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="e.g. claguerr"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <section>
        <h3>Browse prefixes</h3>
        {prefixError && <p role="alert" style={{ color: 'red' }}>{prefixError}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {pageItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handlePrefixClick(item)}
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button type="button" onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
              Previous
            </button>
            <span>Page {page + 1} of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {renderStudent()}
    </section>
  );
}
