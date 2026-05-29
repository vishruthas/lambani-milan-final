import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateUserProfile } from "../services/api";
import districtsData from "../data/districts.json";
import logo from "../assets/logo2.webp";
import "./EditBasicInfo.css";

const GENDER_OPTIONS = ["Male", "Female"];
const MARITAL_OPTIONS = ["Single", "Divorced", "Widowed"];
const YES_NO = ["No", "Yes"];
const DRINK_OPTIONS = ["No", "Yes", "Social Drinker"];
const EDUCATION_OPTIONS = [
  "SSLC/PU",
  "Graduate",
  "Post Graduate",
  "Doctorate",
  "Other"
];
const KUL_OPTIONS = {
  Rathod: [
    "Aaloth","Bhaanaavath","Bhilavath","Degaavath","Karamtoth","Depaavath",
    "Devsoth","Kodaavath","Kumaavath","Kholavath","Meghaavath","Meraajoth",
    "Meraavath","Nenaavath","Paathloth","Dungaavth","Jhandavath","Kaanaavath",
    "Khaatroth","Khethaavath","Khilaavath","Pithaavath","Raajavath","Raamavath",
    "Raathla/Phulia","Ranasoth/Ranavath","Sangaavath","Sotki"
  ],
  Pawar: [
    "Aamgoth","Aivath/Pammar","Baanni","Chaivoth/Pammar","Injraavath",
    "Vankdoth","Inloth Pammar","Jharapla","Lunsavath/Nunsavath",
    "Pamaadiyaa","Tarabaanni","Vislaavath"
  ],
  "Chavan/Chauhan": [
    "Dumaavath/Chauradiya","Keluth","Lavidiya / Lavhadiya",
    "Korra/ Kurra / Mood","Paalthyaa","Sabavat"
  ],
  "Vadithya/Jadhav": [
    "Ajmera","Baadaavath","Barmaavath","Bhagvaandas","Bharoth","Bodaa",
    "Dhaaraavath","Dungaroth","Gangaavath","Goraam","Gugloth","Halaavath",
    "Jaadhav","Jaloth","Jayt","Kagla","Kunsoth","Lokaavath","Lonaavath",
    "Loolaavath","Maaloth","Mohandas","Pipaavath","Poosnamal","Salaavath",
    "Sejaavath","Tejaavath","Tepaavath","Teraavath","Tuvar",
    "Undaavath","VaderJhaad","Vadithya Jaajigiri"
  ],
  "Banoth/Aade": [
    "Aadoth","Ade","Baanoth","Bhojaavath","Daanaavath","Dharmasoth",
    "Dheeravath","Jaatroth","Karnaavath","Kuntaavath","Lavori",
    "Mudavath","Paanaavath","Rupavath","Sabdasoth"
  ]
};

export default function EditBasicInfo() {
  const [formData, setFormData] = useState({});
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await getMyProfile();
    const data = res.profile || {};
    const nameParts = (data.name || "").split(" ");

    setFormData({
      firstName: data.firstName || nameParts[0] || "",
      lastName: data.lastName || nameParts.slice(1).join(" ") || "",
      dob: data.dob || "",
      gender: data.gender || "",
      maritalStatus: data.maritalStatus || "",
      education: data.education || "",
      height: data.height || "",
      state: data.state || "",
      district:
        typeof data.district === "object"
          ? data.district
          : data.district
          ? { id: "0", name: data.district, state: data.state }
          : null,
      occupation: data.occupation || "",
      salary: data.salary || "",
      smoking: data.smoking || "",
      drinking: data.drinking || "",
      kul: data.kul || "",
      gothra: data.gothra || "",
      aboutMe: data.aboutMe || ""
    });

    if (data.state) {
      setDistricts(districtsData[data.state] || []);
    }
  }

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    return today.getFullYear() - birthDate.getFullYear();
  };

  async function handleSave() {
    try {
      await updateUserProfile({
        ...formData,
        height: formData.height ? Number(formData.height) : null,
        age: calculateAge(formData.dob),
        district: formData.district
          ? {
              id: formData.district.id || Date.now().toString(),
              name: formData.district.name,
              state: formData.state
            }
          : null,
        aboutMe: formData.aboutMe || ""
      });
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  }

  return (
    <div className="edit-basic-wrapper">

      {/* HEADER — only addition */}
      <div className="headerinfo">
            
                    <div className="header-centerinfo">
                      <img src={logo} alt="logo" className="logo" />
                      <div className="title">Lambani Milan</div>
                    </div>
                    </div>
     <div className="info-header">

   <button className="es-back-btn" onClick={() => navigate("/profile")} aria-label="Go back to profile">
    &#8592;
  </button>

      <div className="info-title-wrap">

        <h2 className="info-heading">
           Edit Your Info
        </h2>

        <p className="info-desc">
           Update your personal details & information.
        </p>

      </div>

    </div>

      <main className="page0" role="main" aria-labelledby="edit-basic-title">
        
        <div className="grid0">
          <div className="col-60">
            <Input label="First Name" value={formData.firstName || ""} onChange={v => setFormData({ ...formData, firstName: v })} />
          </div>

          <div className="col-60">
            <Input label="Last Name" value={formData.lastName || ""} onChange={v => setFormData({ ...formData, lastName: v })} />
          </div>

          <div className="col-60">
            <SelectField label="Gender" value={formData.gender || ""} options={GENDER_OPTIONS} onChange={v => setFormData({ ...formData, gender: v })} />
          </div>

          <div className="col-60">
            <Input label="Date Of Birth" type="date" value={formData.dob || ""} onChange={v => setFormData({ ...formData, dob: v })} />
          </div>

          <div className="col-60">
            <SelectField label="Marital Status" value={formData.maritalStatus || ""} options={MARITAL_OPTIONS} onChange={v => setFormData({ ...formData, maritalStatus: v })} />
          </div>

          <div className="col-60">
            <Input label="Height" value={formData.height || ""} onChange={v => setFormData({ ...formData, height: v === "" ? "" : Number(v) })} />
          </div>

          <div className="col-60">
            <SelectField
              label="Kul"
              value={formData.kul || ""}
              options={Object.keys(KUL_OPTIONS)}
              onChange={(v) => setFormData({ ...formData, kul: v, gothra: "" })}
            />
          </div>

          <div className="col-60">
            <SelectField
              label="Gothra"
              value={formData.gothra || ""}
              options={KUL_OPTIONS[formData.kul] || []}
              onChange={(v) => setFormData({ ...formData, gothra: v })}
            />
          </div>

          <div className="full-row0">
            <SelectField label="Education" value={formData.education || ""} options={EDUCATION_OPTIONS} onChange={v => setFormData({ ...formData, education: v })} />
          </div>

          <div className="col-60">
            <Input label="Occupation" value={formData.occupation || ""} onChange={v => setFormData({ ...formData, occupation: v })} />
          </div>

          <div className="col-60">
            <Input label="Salary" value={formData.salary || ""} onChange={v => setFormData({ ...formData, salary: v })} />
          </div>

          <div className="col-60">
            <SelectField
              label="State"
              value={formData.state || ""}
              options={Object.keys(districtsData)}
              onChange={(v) => {
                setFormData({ ...formData, state: v, district: null });
                setDistricts(districtsData[v] || []);
              }}
            />
          </div>

          <div className="col-60">
            <SelectField
              label="District"
              value={formData.district?.name || ""}
              options={districts}
              onChange={(v) => {
                setFormData({
                  ...formData,
                  district: { id: Date.now().toString(), name: v, state: formData.state }
                });
              }}
            />
          </div>
          
          <div className="col-60">
            <SelectField label="Smoking" value={formData.smoking || ""} options={YES_NO} onChange={v => setFormData({ ...formData, smoking: v })} />
          </div>

          <div className="col-60">
            <SelectField label="Drinking" value={formData.drinking || ""} options={DRINK_OPTIONS} onChange={v => setFormData({ ...formData, drinking: v })} />
          </div>

          <div className="full-row0">
            <TextArea
              label="About Me"
              value={formData.aboutMe || ""}
              onChange={v => setFormData({ ...formData, aboutMe: v })}
              placeholder="Write a short bio or anything you'd like to share..."
            />
          </div>
        </div>

        <div className="btnRow0" role="region" aria-label="Form actions">
          <button className="btn0" onClick={handleSave}>Save</button>
          <button className="btn0 btn-secondary0" onClick={() => navigate("/profile")}>Cancel</button>
        </div>
        
      </main>
      
    </div>
  );
}

/* Reusable components */

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="field0">
      <label className="label0">{label}</label>
      <input className="input0" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div className="field0">
      <label className="label0">{label}</label>
      <select className="input0" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }) {
  return (
    <div className="field0">
      <label className="label0">{label}</label>
      <textarea
        className="input0 textarea0"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}