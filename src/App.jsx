import React, { useState } from "react";
import "./styles/form.css"
// Helper component for input fields
const FieldInput = ({ field, index, handleChange }) => {
  const inputHandleChange = (e) => {
    // Pass the index and new value up to the parent
    handleChange(index, e.target.value);
  };

  if (field.type === "dropdown") {
    return (
      <select
        className="input-field select-field"
        value={field.value || ""}
        onChange={inputHandleChange}
      >
        <option value="" disabled>Select {field.label}</option>
        {field.options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      className="input-field"
      type={field.type}
      placeholder={field.placeholder}
      value={field.value || ""}
      onChange={inputHandleChange}
    />
  );
};


// The reusable Dropdown component
function Dropdown({ title, defaultFields, isDynamic, onSave, items = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  // Fields state manages the inputs for the item currently being added/edited
  const [fields, setFields] = useState(defaultFields.map(f => ({ ...f })));
  const [editMode, setEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  

  const toggleDropdown = () => {
    // Reset fields to default/clear only if closing the dropdown
    if (isOpen) {
      setFields(defaultFields.map(f => ({ ...f })));
    }
    setIsOpen(!isOpen);
    setEditMode(false);
    setEditIndex(-1);
  };

  const handleChange = (index, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], value: value };
    setFields(newFields);

    // If NOT dynamic (like Personal Info) → update parent immediately
    if (!isDynamic) {
      const liveData = {};
      newFields.forEach(f => {
        liveData[f.label] = f.value || "";
      });
      onSave(liveData);
    }
  };

  const deleteItem = (index) => {
    // Filter the list passed from the parent (items prop)
    const updatedList = items.filter((_, i) => i !== index);
    // Send the updated list back to the parent
    onSave(updatedList);
  };

  const toggleEditMode = (index = -1) => {
    setEditIndex(index);
    setEditMode(true);
    
    if (index > -1) {
      // If editing an existing item: populate fields with the existing data from 'items' prop
      const itemToEdit = items[index];
      const populatedFields = defaultFields.map(field => ({
        ...field,
        value: itemToEdit[field.label] || ""
      }));
      setFields(populatedFields);
    } else {
      // If adding a new item: clear fields
      const cleared = defaultFields.map(f => ({ ...f, value: "" }));
      setFields(cleared);
    }
  };

  const save = () => {
    const entry = {};
    fields.forEach(field => {
      entry[field.label] = field.value || "";
    });

    let updatedList;
    if (editIndex > -1) {
      // Update existing item using the 'items' prop
      updatedList = items.map((item, i) => i === editIndex ? entry : item);
    } else {
      // Add new item using the 'items' prop
      updatedList = [...items, entry];
    }

    // Send the full new list to the parent, which triggers re-render of THIS component with new 'items' prop
    onSave(updatedList);

    // Reset UI state to show the list of tabs again
    const cleared = defaultFields.map(f => ({ ...f, value: "" }));
    setFields(cleared);
    setEditMode(false); // Crucial fix: switch back to list view immediately
    setEditIndex(-1);
  };
  
  const getPreviewFields = (item) => {
    return Object.entries(item).filter(([label, value]) => {
      // Fields to display in the compact list item view
      const displayFields = [
        "Skill", "Level", "College", "Degree", "Company Name", "Position Title", "Project Name" // Added Project Name
      ];
      // Only return truthy values
      return displayFields.includes(label) && value;
    }).map(([, value]) => value);
  };

  return (
    <div className="dropdown-container">
      <div className="dropdown-header" onClick={toggleDropdown}>
        <h3 className="dropdown-title">{title}</h3>
        <button className="dropdown-toggle-btn">
          {!isOpen ? "▼" : "▲"}
        </button>
      </div>

      {/* Input / Edit Mode Section (Has 1rem padding for margin effect) */}
      {isOpen && (!isDynamic || editMode) && (
        <div className="dropdown-content">
          {fields.map((field, index) => (
            <label key={index} className="input-label">
              <span className="input-label-text">
                {field.label}
              </span>
              <FieldInput
                field={field}
                index={index}
                handleChange={handleChange}
              />
            </label>
          ))}

          {/* Dynamic only: show Save/Update button */}
          {isDynamic && (
            <div className="save-button-container">
              <button
                className={`save-button ${editIndex > -1 ? 'update' : 'add'}`}
                onClick={save}
              >
                {editIndex > -1 ? "Update Item" : "Save"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dynamic list preview and Add New button (Has 1rem padding for margin effect) */}
      {isOpen && isDynamic && !editMode && (
        <div className="dynamic-list-container">
          <button
            className="add-new-button"
            onClick={() => toggleEditMode(-1)}
          >
            + Add {title}
          </button>

          <div className="item-list">
            {/* Display list using the 'items' prop (parent state) */}
            {items.map((item, index) => (
              <div
                key={index}
                className="list-item"
              >
                <div className="item-preview">
                  {getPreviewFields(item).map((value, i) => (
                    <span key={i} className="item-text">
                      {value}
                      {i < getPreviewFields(item).length - 1 && <span className="separator-dot"> · </span>}
                    </span>
                  ))}
                </div>

                <div className="item-actions">
                  <button
                    className="action-button edit-btn"
                    onClick={() => toggleEditMode(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete-btn"
                    onClick={() => deleteItem(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component to enforce section structure and handle empty state
function CVSection({ title, children, emptyMessage, itemCount }) {
  const hasContent = itemCount > 0;
  return (
    <div className="cv-section">
      <h2 className="cv-section-title">{title}</h2>
      {hasContent ? (
        <div className="section-content">
          {children}
        </div>
      ) : (
        <p className="section-empty-message">
          {emptyMessage}
        </p>
      )}
    </div>
  );
}


/* ------------------- CV Preview COMPONENT ------------------- */

function CVPreview({ personalInfo, education, skills, projects, experience }) { // Added projects prop

  return (
    <div className="cv-preview-container">
      
      {/* CV Header - Centered */}
      <div className="cv-header">
        <h1 className="cv-name">{personalInfo?.Name || "Your Name"}</h1>
        <div className="contact-info">
            <p className="cv-contact">{personalInfo?.Email}</p>
            {personalInfo?.Email && personalInfo?.LinkedIn && (<span className="separator">&middot;</span>)}
            <p className="cv-contact linkedin">{personalInfo?.LinkedIn}</p>
        </div>
      </div>
      
      {/* CV Sections - RENDERED IN REQUESTED ORDER: EDUCATION, SKILLS, PROJECTS (NEW), EXPERIENCE */}
      <div className="cv-sections-wrapper">

        {/* 1. Education Section (Always rendered) */}
        <CVSection 
          title="Education" 
          itemCount={education.length} 
          emptyMessage="No Education added yet."
        >
          {education.map((e, i) => (
            <div key={i} className="cv-item education-item">
              <div className="item-details">
                <strong className="item-title">{e.Degree}</strong>
                <div className="item-subtitle">{e.College}</div>
              </div>
              <div className="item-date">
                {e["Graduation Date"]}
              </div>
            </div>
          ))}
        </CVSection>
        
        {/* 2. Skills Section (Always rendered) */}
        <CVSection 
          title="Skills" 
          itemCount={skills.length} 
          emptyMessage="No Skills added yet."
        >
          <div className="skills-list">
            {skills.map((s, i) => (
              <div key={i} className="skill-tag">
                <strong className="skill-name">{s.Skill}:</strong> 
                <span className={`skill-level ${s.Level.toLowerCase()}`}>
                  {s.Level}
                </span>
              </div>
            ))}
          </div>
        </CVSection>

        {/* 3. Projects Section  */}
        <CVSection 
          title="Projects" 
          itemCount={projects.length} 
          emptyMessage="No Projects added yet."
        >
          {projects.map((p, i) => (
            <div key={i} className="cv-item project-item">
              <div className="item-details">
                <strong className="item-title">{p["Project Name"]}</strong>
                <div className="item-subtitle">{p.Technologies}</div>
                <p className="item-description">{p.Description}</p>
              </div>
              <div className="item-date">
                {p["Start Date"]} – {p["End Date"]}
              </div>
            </div>
          ))}
        </CVSection>

        {/* 4. Experience Section (Always rendered) */}
        <CVSection 
          title="Experience" 
          itemCount={experience.length} 
          emptyMessage="No Experience added yet."
        >
          {experience.map((ex, i) => (
            <div key={i} className="cv-item experience-item">
              <div className="item-details">
                <strong className="item-title">{ex["Position Title"]}</strong>
                <div className="item-subtitle">{ex["Company Name"]}</div>
                <p className="item-description">{ex.Responsibilities}</p>
              </div>
              <div className="item-date">
                {ex["Start Date"]} – {ex["End Date"]}
              </div>
            </div>
          ))}
        </CVSection>

      </div>
    </div>
  );
}


/* ------------------- MAIN APP COMPONENT ------------------- */

export default function App() {
  const [personalInfo, setPersonalInfo] = useState({});
  const [educationList, setEducationList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [projectsList, setProjectsList] = useState([]); // New state for Projects
  const [experienceList, setExperienceList] = useState([]);

  // Function to handle clearing all state
  const handleClearResume = () => {
    // We clear the state, and rely on prop changes for updates
    setPersonalInfo({});
    setEducationList([]);
    setSkillsList([]);
    setProjectsList([]); 
    setExperienceList([]);
  };


  const handlePrint = () => {
    window.print();
  };



  return (
    <div className="app-container">
      
      {/* Tailwind is included via script tag */}
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Header Bar containing Title and Actions */}
      <div className="header-bar">
        <h1 className="app-title">CV Builder</h1>
        
        {/* Action Buttons: Clear and Print */}
        <div className="action-bar">
          <button 
            className="action-btn clear-btn"
            onClick={handleClearResume}
          >
            Clear Resume
          </button>
          <button 
            className="action-btn print-btn"
            onClick={handlePrint}
          >
            Print CV
          </button>
        </div>
      </div>

      <div className="main-layout">

        {/* Left Column: Form Sections (50% width on desktop) */}
        <div className="form-column">
          <Dropdown
            title="Personal Info"
            defaultFields={[
              { label: "Name", type: "text", placeholder: "Mostafa Sakr" },
              { label: "Email", type: "email", placeholder: "user@email.com" },
              { label: "LinkedIn", type: "text", placeholder: "LinkedIn URL" }
            ]}
            isDynamic={false}
            onSave={setPersonalInfo}
          />

          <Dropdown
            title="Education"
            items={educationList}
            defaultFields={[
              { label: "College", type: "text", placeholder: "Stanford" },
              { label: "Degree", type: "text", placeholder: "Master of Science" },
              { label: "Graduation Date", type: "date", placeholder: "" }
            ]}
            isDynamic={true}
            onSave={setEducationList}
          />
          
          <Dropdown
            title="Skills"
            items={skillsList}
            defaultFields={[
              { label: "Skill", type: "text", placeholder: "React/Next.js" },
              {
                label: "Level",
                type: "dropdown",
                options: ["Beginner", "Intermediate", "Expert"]
              }
            ]}
            isDynamic={true}
            onSave={setSkillsList}
          />

          {/* NEW: Projects Dropdown */}
          <Dropdown
            title="Projects"
            items={projectsList}
            defaultFields={[
              { label: "Project Name", type: "text", placeholder: "Portfolio Website" },
              { label: "Start Date", type: "date", placeholder: "" },
              { label: "End Date", type: "date", placeholder: "" },
              { label: "Technologies", type: "text", placeholder: "e.g., React, Tailwind CSS" },
              { label: "Description", type: "text", placeholder: "Briefly describe the project and your role." },
            ]}
            isDynamic={true}
            onSave={setProjectsList}
          />

          <Dropdown
            title="Experience"
            items={experienceList}
            defaultFields={[
              { label: "Company Name", type: "text", placeholder: "Siemens" },
              { label: "Position Title", type: "text", placeholder: "Pex Engineer" },
              { label: "Start Date", type: "date", placeholder: "" },
              { label: "End Date", type: "date", placeholder: "" },
              { label: "Responsibilities", type: "text", placeholder: "e.g., Coding, Project Management" },
            ]}
            isDynamic={true}
            onSave={setExperienceList}
          />
        </div>


        <div className="preview-column">
          <CVPreview
            personalInfo={personalInfo}
            education={educationList}
            skills={skillsList}
            projects={projectsList} 
            experience={experienceList}
          />
        </div>
      </div>
    </div>
  );
}