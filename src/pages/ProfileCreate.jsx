import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserProfile } from "../services/api";
import "./ProfileCreate.css";
import BackgroundSlider from "../components/BackgroundSlider";
import districtsData from "../data/districts.json";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
  "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal"
];

const KUL_OPTIONS = {

    "Banoth/Aade": [
      "Aadoth","Ade","Baanoth","Bhojaavath","Daanaavath","Dharmasoth",
      "Dheeravath","Jaatroth","Karnaavath","Kuntaavath","Lavori",
      "Mudavath","Paanaavath","Rupavath","Sabdasoth","Other"
    ],

    "Chavan/Chauhan": [
      "Dumaavath/Chauradiya","Keluth","Korra/ Kurra / Mood","Lavidiya / Lavhadiya",
      "Paalthyaa","Sabavat","Other"
    ],

    Pawar: [
      "Aamgoth","Aivath/Pammar","Baanni","Chaivoth/Pammar","Injraavath",
      "Inloth Pammar","Jharapla","Lunsavath/Nunsavath",
      "Pamaadiyaa","Tarabaanni","Vankdoth","Vislaavath","Other"
    ],

    Rathod: [
      "Aaloth","Bhaanaavath","Bhilavath","Degaavath","Depaavath",
      "Devsoth","Dungavath","Jhandavath","Kaanaavath","Karamtoth","Kholavath","Khaatroth",
      "Khethaavath","Khilaavath","Kodaavath","Kumaavath","Meghaavath","Meraajoth",
      "Meraavath","Nenaavath","Paathloth",
      "Pithaavath","Raajavath","Raamavath",
      "Raathla/Phulia","Ranasoth/Ranavath","Sangaavath","Sotki","Other"
    ],
      
    "Vadithya/Jadhav": [
      "Ajmera","Dhaaraavath","Dungaroth","Baadaavath","Barmaavath","Bhagvaandas",
      "Bharoth","Bodaa","Gangaavath","Goraam","Gugloth","Halaavath",
      "Jaadhav","Jaloth","Jayt","Kagla","Kunsoth","Lokaavath","Lonaavath",
      "Loolaavath","Maaloth","Mohandas","Pipaavath","Poosnamal","Salaavath",
      "Sejaavath","Tejaavath","Tepaavath","Teraavath","Tuvar",
      "Undaavath","VaderJhaad","Vadithya Jaajigiri","Other"
    ],
    
  };
function ProfileCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "",
    maritalStatus: "",
    caste: "",
    subCaste: "",
    height: "",
    education: "",
    occupation: "",
    state: "",
    district: "",
    smoking: "",
    drinking: "",
    salary: "",
    aboutMe: "",
    kul: "",
    gothra: "",
    otherGothra: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [districts, setDistricts] = useState([]);
  const [ageValidationError, setAgeValidationError] = useState("");

  const getDistrictsForState = (stateKey) => {
    if (!stateKey) return [];
    if (districtsData[stateKey]) return districtsData[stateKey];
    const trimmed = stateKey.trim();
    if (districtsData[trimmed]) return districtsData[trimmed];
    const foundKey = Object.keys(districtsData).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (foundKey) return districtsData[foundKey];
    return [];
  };

  /* useEffect(() => {
  if (!form.dob) {
    setForm((prev) => ({ ...prev, age: "" }));
    setAgeValidationError("");
    return;
  }

  const birth = new Date(form.dob);
  if (Number.isNaN(birth.getTime())) {
    setForm((prev) => ({ ...prev, age: "" }));
    setAgeValidationError("");
    return;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (form.gender === "Female" && age < 18) {
    setAgeValidationError("Minimum age for female is 18 years.");
  } else if (form.gender === "Male" && age < 21) {
    setAgeValidationError("Minimum age for male is 21 years.");
  } else {
    setAgeValidationError("");
  }

}, [form.dob, form.gender]); */
useEffect(() => {
  if (!form.dob) {
    setForm((prev) => ({ ...prev, age: "" }));
    setAgeValidationError("");
    return;
  }

  const birth = new Date(form.dob);
  if (Number.isNaN(birth.getTime())) {
    setForm((prev) => ({ ...prev, age: "" }));
    setAgeValidationError("");
    return;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // ADD THIS
  setForm((prev) => ({
    ...prev,
    age: age.toString()
  }));

  if (form.gender === "Female" && age < 18) {
    setAgeValidationError("Minimum age for female is 18 years.");
  } else if (form.gender === "Male" && age < 21) {
    setAgeValidationError("Minimum age for male is 21 years.");
  } else {
    setAgeValidationError("");
  }
}, [form.dob, form.gender]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "state") {
      const list = getDistrictsForState(value);
      setDistricts(list);
      setForm((prev) => ({ ...prev, state: value, district: "" }));
      return;
    }

    if (name === "district") {
      if (!value) {
        setForm((prev) => ({ ...prev, district: "" }));
        return;
      }
      try {
        const parsed = JSON.parse(value);
        const valid = parsed && typeof parsed === "object" && parsed.name;
        setForm((prev) => ({ ...prev, district: valid ? parsed : value }));
      } catch {
        setForm((prev) => ({ ...prev, district: value }));
      }
      return;
    }

    if (name === "kul") {
      setForm((prev) => ({
        ...prev,
        kul: value,
        gothra: "",
        otherGothra: ""
      }));
      return;
    }

    if (name === "gothra") {
      setForm((prev) => ({
        ...prev,
        gothra: value,
        otherGothra: value === "Other" ? prev.otherGothra : ""
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    if (ageValidationError) {
      setError(ageValidationError);
      setLoading(false);
      return;
    }
    e.preventDefault();
    setError("");
    setLoading(true);

    const requiredFields = ["firstName", "lastName", "dob", "gender", "state", "district"];
    for (const f of requiredFields) {
      if (!form[f] || (typeof form[f] === "string" && form[f].trim() === "")) {
        setError("Please fill all required fields.");
        setLoading(false);
        return;
      }
    }

    try {
      const districtPayload =
        typeof form.district === "object" && form.district !== null
          ? form.district
          : { id: "", name: form.district || "", state: form.state };

      const otherGothraPayload = form.gothra === "Other" ? (form.otherGothra || "") : "";

      const payload = {
        ...form,
        district: districtPayload,
        otherGothra: otherGothraPayload
      };

      const res = await createUserProfile(payload);

      if (res && res.nextStep === 2) {
        navigate("/selfie-upload");
      } else {
        navigate("/home");
      }
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 401 || status === 403) {
        setError("Session expired or unauthorized. Please log in again.");
      } else {
        setError(err?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
  form.firstName.trim() &&
  form.lastName.trim() &&
  form.gender &&
  form.dob &&
  form.maritalStatus &&
  form.height &&
  form.kul &&
  form.gothra &&
  (form.gothra !== "Other" || form.otherGothra.trim()) &&
  form.education &&
  form.occupation.trim() &&
  form.state &&
  form.district &&
  form.smoking &&
  form.drinking &&
  !ageValidationError;

  return (
    <div className="page1">
      <div className="card1">
        <h1 className="title1">Create Your Profile</h1>

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <div className="form-inner1">
            <div className="grid">

              {/* Row 1: First Name, Last Name */}
              <Field label="First Name" name="firstName" required>
                <input
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </Field>
              <Field label="Last Name" name="lastName" required>
                <input
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </Field>

              {/* Row 2: Gender, Date of Birth */}
              <Field label="Gender" name="gender" required>
                <select value={form.gender} onChange={handleChange}>
                  <option value="" disabled hidden>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
              <Field label="Date of Birth" name="dob" required>
                <input
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                />
              </Field>

              {/* Row 3: Age */}
              <div className="field age full">
                <label className="label">Age</label>
                 <div className="age-value">{form.age || ""}</div>

                {ageValidationError && (
                  <p className="age-error">{ageValidationError}</p>
                )}
              </div>


              {/* Row 4: Marital Status, Height */}
              <Field label="Marital Status" name="maritalStatus" required>
                <select value={form.maritalStatus} onChange={handleChange}>
                  <option value="" disabled hidden>Select</option>
                  <option value="Single">Single</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </Field>
              <Field label="Height (cm)" name="height" required>
                <input type="number" value={form.height} onChange={handleChange} placeholder="e.g., 170" />
              </Field>

              {/* Row 5: Kul, Gothra */}
              <Field label="Kul" name="kul" required>
                <select
                  name="kul"
                  id="kul"
                  value={form.kul || ""}
                  onChange={(e) => {
                    const selectedKul = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      kul: selectedKul,
                      gothra: "",
                      otherGothra: ""
                    }));
                  }}
                ><option value="" disabled hidden>Select Kul</option>
                  {Object.keys(KUL_OPTIONS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Gothra" name="gothra" required>
                <select
                  name="gothra"
                  id="gothra"
                  value={form.gothra || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, gothra: e.target.value, otherGothra: prev.otherGothra }))
                  }
                  disabled={!form.kul}
                >
                  <option value="" disabled hidden>Select Gothra</option>
                  {form.kul &&
                    KUL_OPTIONS[form.kul].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                </select>
              </Field>

              {/* Row 6: Other Gothra */}
              <Field label="Other" name="otherGothra" className="full">
                <input
                  id="otherGothra"
                  name="otherGothra"
                  value={form.otherGothra || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, otherGothra: e.target.value }))}
                  disabled={form.gothra !== "Other"}
                  placeholder={form.gothra === "Other" ? "Enter gothra" : "If other Specify"}
                />
              </Field>

              {/* Row 7: Education */}
              <Field label="Education" name="education" className="full" required>
                <select value={form.education} onChange={handleChange} placeholder="Highest qualification" >
                  <option value="" disabled hidden>Education Level</option>
                  <option>SSLC/PU</option>
                  <option>Graduate</option>
                  <option>Post Graduate</option>
                  <option>Doctorate</option>
                  <option>Other</option>
                </select>
              </Field>

              {/* Row 8: Occupation, Annual Salary */}
              <Field label="Occupation" name="occupation" required>
                <input value={form.occupation} onChange={handleChange} placeholder="Your occupation" />
              </Field>
              <Field label="Annual Salary" name="salary">
                <input value={form.salary} onChange={handleChange} placeholder="e.g., 6,00,000" />
              </Field>

              {/* Row 9: State, District (replaces City) */}
              <Field label="State" name="state" required>
                <select value={form.state} onChange={handleChange}>
                  <option value="" disabled hidden>Select State</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <Field label="District" name="district" required>
                <select
                  name="district"
                  value={form.district ? JSON.stringify(form.district) : ""}
                  onChange={handleChange}
                  required
                  disabled={!form.state || districts.length === 0}
                >
                  <option value="">Select District</option>
                  {districts.map((d, index) => (
                    <option
                      key={index}
                      value={JSON.stringify({
                        id: index.toString(),
                        name: d,
                        state: form.state
                      })}
                    >
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Row 10: Smoking, Drinking */}
              <Field label="Smoking" name="smoking" required>
                <select value={form.smoking} onChange={handleChange}>
                  <option value="" disabled hidden>Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Field>
              <Field label="Drinking" name="drinking" required>
                <select value={form.drinking} onChange={handleChange}>
                  <option value="" disabled hidden>Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                  <option value="Social Drinker">Social Drinker</option>
                </select>
              </Field>

              {/* Row 11: About Me */}
              <Field label="About" name="aboutMe" className="full">
                <textarea value={form.aboutMe} onChange={handleChange} rows="4" placeholder="Write a short intro about yourself" />
              </Field>

            </div>

            {error && <p className="error" role="alert">{error}</p>}

            <div className="actions">
              <button
                
                className={`prefs-primary ${(!isFormValid || loading) ? "disabled-btn" : ""}`}
                type="submit"
                disabled={loading || !isFormValid}
              >
              {loading ? "Saving..." : "Save & Continue"}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, children, required = false, className = "" }) {
  const child = React.cloneElement(children, {
    id: name,
    name,
    className: "input-field",
    "aria-required": required || undefined,
  });

  const classes = `field ${className || "col"}`.trim();

  return (
    <div className={classes}>
      <label htmlFor={name} className="label">
        {label}{required && <span className="req"> *</span>}
      </label>
      {child}
    </div>
  );
}

export default ProfileCreate;