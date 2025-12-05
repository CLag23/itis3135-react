import { useEffect, useState } from 'react';

const API_BASE = 'https://dvonb.xyz/api/2025-fall/itis-3135/students/';

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
  const [allStudents, setAllStudents] = useState([]);
  const [nameSearch, setNameSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllMode, setShowAllMode] = useState(false);

  // Checkbox state for field visibility
  const [showFields, setShowFields] = useState({
    name: true,
    mascot: true,
    image: true,
    personalStatement: true,
    backgrounds: true,
    classes: true,
    extraInfo: true,
    quote: true,
    links: true
  });

  useEffect(() => {
    document.title = "Carl's Laguerre Introduction Data";

    const loadStudents = async () => {
      try {
        const resp = await fetch(API_BASE);
        if (!resp.ok) return;
        const data = await resp.json();
        if (Array.isArray(data)) {
          const uniquePrefixes = [...new Set(data.map((item) => item.prefix).filter(Boolean))];

          // Fetch all students for slideshow
          const studentPromises = uniquePrefixes.map(async (prefix) => {
            try {
              const response = await fetch(`${API_BASE}${encodeURIComponent(prefix)}`);
              if (!response.ok) return null;
              const studentData = await response.json();
              return Array.isArray(studentData) ? studentData[0] : studentData;
            } catch {
              return null;
            }
          });

          const students = await Promise.all(studentPromises);
          setAllStudents(students.filter(Boolean));
        }
      } catch (err) {
        console.error('Error loading students:', err);
      }
    };

    loadStudents();
  }, []);


  const filteredStudents = allStudents.filter((student) => {
    if (!nameSearch.trim()) return true;
    const fullName = getFullName(student).toLowerCase();
    const searchTerm = nameSearch.toLowerCase();
    return fullName.includes(searchTerm);
  });

  // Handle checkbox changes
  const handleCheckboxChange = (field) => {
    setShowFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Slideshow navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredStudents.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < filteredStudents.length - 1 ? prev + 1 : 0));
  };

  const renderStudent = (studentData) => {
    if (!studentData) return null;
    const divider = studentData.divider || '|';
    const name = getFullName(studentData);
    const titleParts = [];
    if (showFields.name) titleParts.push(name || 'Student');
    if (showFields.mascot && studentData.mascot) titleParts.push(studentData.mascot);

    const media = studentData.media;
    const imageSrc = media?.src
      ? (media.src.startsWith('http') ? media.src : `https://dvonb.xyz${media.src}`)
      : '';
    const showImage = showFields.image && media?.hasImage && imageSrc;

    return (
      <article>
        {titleParts.length > 0 && <h2>{titleParts.join(` ${divider} `)}</h2>}
        {studentData.acknowledgement && (
          <p><strong>Acknowledgement:</strong> {studentData.acknowledgement}</p>
        )}

        {showImage && (
          <figure>
            <img src={imageSrc} alt={media.caption || name || 'Student'} style={{ maxWidth: '320px', height: 'auto' }} />
            {media.caption && <figcaption>{media.caption}</figcaption>}
          </figure>
        )}

        {showFields.backgrounds && <Backgrounds backgrounds={studentData.backgrounds} />}

        {showFields.classes && studentData.courses?.length ? (
          <>
            <h3>Courses</h3>
            <CourseList courses={studentData.courses} />
          </>
        ) : null}

        {showFields.personalStatement && studentData.personalStatement && (
          <>
            <h3>Personal Statement</h3>
            <p>{studentData.personalStatement}</p>
          </>
        )}

        {showFields.quote && studentData.quote?.text && (
          <p><strong>Quote:</strong> {studentData.quote.text}{studentData.quote.author ? ` - ${studentData.quote.author}` : ''}</p>
        )}

        {showFields.extraInfo && studentData.funFact && <p><strong>Fun Fact:</strong> {studentData.funFact}</p>}
        {showFields.extraInfo && studentData.computer && <p><strong>Computer:</strong> {studentData.computer}</p>}

        {showFields.links && studentData.links ? (
          <>
            <h3>Links</h3>
            <Links links={studentData.links} divider={divider} />
          </>
        ) : null}
      </article>
    );
  };

  return (
    <section>
      <h2>Introduction JSON Data</h2>

      {/* Name Search Input */}
      <section>
        <h3>Search by Name</h3>
        <input
          type="text"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          placeholder="Search by first or last name..."
          style={{ width: '100%', maxWidth: '400px', padding: '0.5rem' }}
        />
        <p><strong>Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</strong></p>
      </section>

      {/* Field Visibility Checkboxes */}
      <section>
        <h3>Display Fields</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          <label>
            <input
              type="checkbox"
              checked={showFields.name}
              onChange={() => handleCheckboxChange('name')}
            />
            {' '}Name
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.mascot}
              onChange={() => handleCheckboxChange('mascot')}
            />
            {' '}Mascot
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.image}
              onChange={() => handleCheckboxChange('image')}
            />
            {' '}Image
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.personalStatement}
              onChange={() => handleCheckboxChange('personalStatement')}
            />
            {' '}Personal Statement
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.backgrounds}
              onChange={() => handleCheckboxChange('backgrounds')}
            />
            {' '}Backgrounds
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.classes}
              onChange={() => handleCheckboxChange('classes')}
            />
            {' '}Classes
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.extraInfo}
              onChange={() => handleCheckboxChange('extraInfo')}
            />
            {' '}Extra Information
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.quote}
              onChange={() => handleCheckboxChange('quote')}
            />
            {' '}Quote
          </label>
          <label>
            <input
              type="checkbox"
              checked={showFields.links}
              onChange={() => handleCheckboxChange('links')}
            />
            {' '}Links
          </label>
        </div>
      </section>

      {/* Slideshow Navigation */}
      {filteredStudents.length > 0 && (
        <section>
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setShowAllMode(!showAllMode)}
              style={{ marginBottom: '0.5rem' }}
            >
              {showAllMode ? 'Show Slideshow' : 'Show All Students'}
            </button>
          </div>

          {!showAllMode ? (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button type="button" onClick={goToPrevious}>
                  Previous
                </button>
                <span>Student {currentIndex + 1} of {filteredStudents.length}</span>
                <button type="button" onClick={goToNext}>
                  Next
                </button>
              </div>
              {renderStudent(filteredStudents[currentIndex])}
            </>
          ) : (
            <div>
              {filteredStudents.map((student, index) => (
                <div key={index} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #ccc' }}>
                  {renderStudent(student)}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
