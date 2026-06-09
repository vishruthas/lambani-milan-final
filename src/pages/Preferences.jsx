import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { savePreferences, getMyProfile } from "../services/api";
import "./Preferences.css";
import districtsData from "../data/districts.json";

export default function Preferences() {
  const navigate = useNavigate();
  const gotraRef = useRef(null);
  const districtRef = useRef(null);

  const DOESNT = "Doesn't Matter";

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

  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [gothraSearch, setGothraSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [expandedKuls, setExpandedKuls] = useState({});
  const [state, setState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [showDistricts, setShowDistricts] = useState(false);
  const [locations, setLocations] = useState({});

  const [educationLevel, setEducationLevel] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [smoking, setSmoking] = useState("");
  const [drinking, setDrinking] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ageError, setAgeError] = useState("");

  const [kuls, setKuls] = useState([]);
  const [gotras, setGotras] = useState([]);
  const [otherGotra, setOtherGotra] = useState("");

  const [selectedKul, setSelectedKul] = useState("");
  const [tempGothras, setTempGothras] = useState({});
  const [selectedGothras, setSelectedGothras] = useState({});
  const [showGothra, setShowGothra] = useState(false);
  const [gothraPlaceholder, setGothraPlaceholder] = useState("Select Gothra");
  const [districtPlaceholder, setDistrictPlaceholder] = useState("Select District");
  const [districtDoesntMatter, setDistrictDoesntMatter] = useState(false);
 
  const [gender, setGender] = useState("");

  useEffect(() => {
    function handleClickOutside(event) {
      if (gotraRef.current && !gotraRef.current.contains(event.target)) {
        setExpandedKuls({});
        setShowGothra(false);
        setGothraPlaceholder("Select Gothra");
      setGothraSearch("");
      setSelectedKul("");
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setShowDistricts(false);
        setDistrictPlaceholder("Select District");
        setDistrictSearch("");
        setState("");
        setDistricts([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* FETCH GENDER */

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const profile = await getMyProfile();
      setGender(profile.gender || "");
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  fetchProfile();
}, []);

  /* ---------- Location handlers ---------- */

  const handleStateChange = (e) => {
    const value = e.target.value;
    setState(value);
    setDistricts(districtsData[value] || []);
    setSelectedDistricts(locations[value] ? [...locations[value]] : []);
    setShowDistricts(true);
    setDistrictSearch("");
  };

  const handleDistrictToggle = (districtName) => {

  // Doesn't Matter selected
  if (districtName === "DOESNT_MATTER") {

    setSelectedDistricts([]);

    setLocations((prev) => ({
      ...prev,
      [state]: [],
    }));

    return;
  }

  setSelectedDistricts((prev) => {

    let updated;

    if (prev.includes(districtName)) {
      updated = prev.filter((d) => d !== districtName);
    } else {
      updated = [...prev, districtName];
    }

    setLocations((locPrev) => ({
      ...locPrev,
      [state]: updated,
    }));

    return updated;
  });
};

  const addLocation = () => {
  if (!state) {
    alert("Please select a state");
    return;
  }

  setLocations(prev => {
    const existing = prev[state] || [];

    const merged =
      selectedDistricts.length === 0
        ? [] 
        : Array.from(new Set([...existing, ...selectedDistricts]));

    return { ...prev, [state]: merged };
  });

  setState("");
  setDistricts([]);
  //setSelectedDistricts([]);
  setSelectedDistricts(() => []);
  setShowDistricts(false);
  setDistrictSearch("");
};


  const removeLocation = (stateName, districtToRemove = null) => {
    setLocations(prev => {
      const copy = { ...prev };
      if (!copy[stateName]) return prev;
      if (districtToRemove === null) { delete copy[stateName]; return copy; }
      const updated = copy[stateName].filter(d => d !== districtToRemove);
      if (updated.length === 0) delete copy[stateName];
      else copy[stateName] = updated;
      return copy;
    });
  };

  /* ---------- Kul / Gothra handlers ---------- */

  const onKulsChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    if (values.includes(DOESNT)) {
      setKuls([DOESNT]); setSelectedGothras({}); setTempGothras({}); setOtherGotra("");
    } else {
      setKuls(values.filter(v => v !== DOESNT));
    }
  };

  const handleKulAdd = () => {
    if (!selectedKul) return;
    if (selectedKul === DOESNT) {
      setKuls([DOESNT]); setSelectedGothras({}); setTempGothras({}); setOtherGotra(""); setSelectedKul(""); return;
    }
    setKuls(prev => {
      const cleaned = prev.filter(k => k !== DOESNT);
      if (cleaned.includes(selectedKul)) return cleaned;
      return [...cleaned, selectedKul];
    });
    setSelectedKul("");
  };

  const handleTempGothraToggle = (kul, gothra) => {

  setTempGothras(prev => {

    const existing = prev[kul] || [];
    if (gothra === DOESNT) {

      return {
        ...prev,
        [kul]: []
      };
    }
    let updated = [...existing];

    if (updated.includes(gothra)) {
      updated = updated.filter(g => g !== gothra);
    } else {
      updated.push(gothra);
    }

    return {
      ...prev,
      [kul]: updated
    };
  });
};
  const handleGothraAdd = (kul) => {
    const temp = tempGothras[kul];
    const gothraToSave = temp === undefined ? [] : temp;
    setSelectedGothras(prev => ({ ...prev, [kul]: gothraToSave }));
    setKuls(prev => {
      if (prev.includes(DOESNT)) return prev;
      if (prev.includes(kul)) return prev;
      return [...prev, kul];
    });
    setTempGothras(prev => { const copy = { ...prev }; delete copy[kul]; return copy; });
  };

  const removeGothra = (kul, gothra) => {
    setSelectedGothras(prev => {
      const existing = prev[kul] || [];
      const updated = existing.filter(g => g !== gothra);
      if (updated.length === 0) {
        const copy = { ...prev }; delete copy[kul];
        setKuls(k => k.filter(x => x !== kul));
        return copy;
      }
      return { ...prev, [kul]: updated };
    });
    if (gothra === "Other") setOtherGotra("");
  };

  const removeKulAll = (kul) => {
    setSelectedGothras(prev => { const copy = { ...prev }; delete copy[kul]; return copy; });
    setKuls(prev => prev.filter(k => k !== kul));
    setTempGothras(prev => { const copy = { ...prev }; delete copy[kul]; return copy; });
  };

  const openGothraForKul = (kul) => {
    if (!kul || kul === DOESNT || kuls.includes(DOESNT)) return;
    setSelectedKul(kul); setShowGothra(true); setGothraSearch("");
    setTempGothras(prev => ({ ...prev, [kul]: selectedGothras[kul] ? [...selectedGothras[kul]] : [] }));
  };

  /* ---------- Submit ---------- */
  const submit = async () => {
    try {
      setLoading(true); setError(""); setAgeError("");
     const minimumAllowedAge = gender?.toLowerCase() === "Male" ? 18 : 21;

      if (minAge && Number(minAge) < minimumAllowedAge) {
        setAgeError(
        `Minimum age should be ${minimumAllowedAge} or above`
      );
      setLoading(false);
      return;
    }

      if (minAge && maxAge && Number(minAge) >= Number(maxAge)) {
        setAgeError("Minimum age should be less than maximum age.");
        setLoading(false);
        return;
    }
      if (kuls.length > 0 && !kuls.includes(DOESNT)) {
        if (Object.keys(selectedGothras).length === 0) {
          setError("Please select at least one Gothra for the chosen Kul(s)."); setLoading(false); return;
        }
      }
      const formattedLocations = 
      Object.entries(locations).flatMap(([st, dists]) => {
        if (!dists || dists.length === 0) return [{ state: st, district: null }];
        return dists.map(d => ({ 
          state: st, 
          district: {
            name: d,
            state: st }}));
      });
      const preferredKulGothra = (() => {
        if (kuls.includes(DOESNT)) return [{ kul: DOESNT, gothra: [DOESNT] }];
        if (Object.keys(selectedGothras).length === 0) return [{ kul: DOESNT, gothra: [DOESNT] }];
        return Object.entries(selectedGothras).map(([kul, goths]) => {
          if (!Array.isArray(goths) || goths.length === 0) return { kul, gothra: [DOESNT] };
          const normalized = goths.map(g => (g === "Other" ? (otherGotra || "Other") : g));
          return { kul, gothra: normalized };
        });
      })();
      const payload = {
        minAge: minAge === "" ? null : Number(minAge),
        maxAge: maxAge === "" ? null : Number(maxAge),
        preferredLocations: formattedLocations,
        educationLevel,
        preferredKulGothra,
        preferredMaritalStatus: maritalStatus,
        smoking,
        drinking
      };
      console.log("payload:", JSON.stringify(payload, null, 2));
      await savePreferences(payload);
      navigate("/home", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };
  const isFormValid =
  minAge &&
  maxAge &&
  Number(minAge) >=
  (gender?.toLowerCase() === "Male" ? 18 : 21) &&
  Number(maxAge) >
  (gender?.toLowerCase() === "Male" ? 18 : 21) &&
  Number(minAge) < Number(maxAge) &&
  Object.keys(locations).length > 0 &&
  (
    kuls.includes(DOESNT) ||
    Object.keys(selectedGothras).length > 0
  ) &&
  educationLevel &&
  maritalStatus &&
  smoking &&
  drinking;

  return (
    <>
      <div className="page-content">
        <div className="prefs-card">
          <h2 className="prefs-title">Partner Preferences</h2>

          <div className="prefs-inner">

            {/* ── Age ── */}
            <h3 className="prefs-sub">Preferred Age <span className="required">*</span></h3>
            <div className="prefs-row-age">
              
              <input
              className="prefs-control"
              type="number"
              placeholder="Min Age"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              />
              
              <input
                className="prefs-control"
                type="number"
                placeholder="Max Age"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>
            
            {/* ── Locations ── */}
            <h3 className="prefs-sub">Preferred Locations <span className="required">*</span></h3>
            <div className="prefs-row-inline"> 
            {/* State  */}
            <select
              className="prefs-select-full"
              value={state}
              onChange={handleStateChange}
              required
            >
              <option value="" disabled hidden>Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* District  */}
            <div className="prefs-row-inline" ref={districtRef}>
              <div className="gotra-area">
                <div
                  className={`district-dropdown-header${!state ? " disabled" : ""}`}
                  onClick={() => { if (!state) return; setShowDistricts(prev => !prev); }}
                >
                  {/* {selectedDistricts.length > 0 ? `${selectedDistricts.length} selected` : "Select District"} */}
                  {state
  ? (selectedDistricts.length > 0
      ? `${selectedDistricts.length} selected`
      : "Select District")
  : "Select District"}
                </div>

                {showDistricts && (
                  <div className="district-dropdown-list">
                    <input
                      className="search-input"
                      placeholder="Search districts..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                    />
                    <div className="select-all-row" style={{ marginTop: 6 }}>
                      <label className="select-all-wrap">
                        <input
                          type="checkbox"
                          checked={
                            Object.prototype.hasOwnProperty.call(locations, state) &&
                            locations[state].length === 0
                          }
                          onChange={() => handleDistrictToggle("DOESNT_MATTER")}
                        />
                        <span className="gothra-label-text">Doesn't Matter</span>
                      </label>
                    </div>
                    {(!districts || districts.length === 0) && <div className="district-item">No districts</div>}
                    <div className="gothra-list" style={{ marginTop: 8 }}>
                      {(districts || [])
                        .filter(d => d.toLowerCase().includes((districtSearch || "").toLowerCase()))
                        .filter(d => districts.includes(d))
                        .map((d) => (
                          <div key={d} className="gothra-row district-row">
                            <label className="gothra-label-wrap">
                              <input
                                type="checkbox"
                                className="gothra-checkbox"
                                checked={selectedDistricts.includes(d)}
                                onChange={() => handleDistrictToggle(d)}
                              />
                              <span className="gothra-label-text">{d}</span>
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            <div className="prefs-full" style={{ marginTop: 12 }}>
              <div className="prefs-tags">
                {Object.entries(locations).map(([st, dists]) => {
                  const items = (!dists || dists.length === 0) ? ["__ALL__"] : dists;
                  return (
                    <div key={st} className="prefs-tag">
                      <strong className="kul-name">{st}:</strong>
                      <div className="selected-tags" style={{ marginLeft: 8 }}>
                        {items.map((d, idx) => {
                          if (d === "__ALL__") {
                            return (
                              <div key={`${st}-all`} className="selected-tag">
                                All Districts
                                <button type="button" className="selected-remove" onClick={() => removeLocation(st, null)} aria-label={`Remove all districts for ${st}`}>✕</button>
                              </div>
                            );
                          }
                          const label = (typeof d === "object" && d !== null) ? (d.name || d) : d;
                          return (
                            <div key={`${st}-${label}-${idx}`} className="selected-tag">
                              {label}
                              <button type="button" className="selected-remove" onClick={() => removeLocation(st, d)} aria-label={`Remove ${label} from ${st}`}>✕</button>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginLeft: 12, display: "inline-block" }}>
                        <button type="button" className="prefs-remove" onClick={() => removeLocation(st, null)} aria-label={`Remove ${st}`} style={{ marginLeft: 8 }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── KUL + GOTHRA ── */}
            <div ref={gotraRef} className="prefs-section" style={{ marginTop: 18 }}>
              <h3 className="prefs-sub">Preferred Kul & Gothra <span className="required">*</span></h3>
              <div className="prefs-row-inline kul-gothra-row">

              {/* Kul  */}
              <select
                className="prefs-select-full"
                value={selectedKul}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === DOESNT) {
                  setKuls([DOESNT]);
                  setSelectedGothras({});
                  setTempGothras({});
                  setOtherGotra("");
                  setSelectedKul("");
                  setShowGothra(false);
                  return;
                }
                  setKuls(prev => prev.filter(k => k !== DOESNT));
                  setSelectedKul(val);
                  setGothraSearch("");
                  if (val) {
                  setTempGothras(prev => ({
                  ...prev,
                  [val]: selectedGothras[val]
                  ? [...selectedGothras[val]]
                  : []
                }));
                  }
                }}
              >
                <option value="">Select Kul</option>
                <option value={DOESNT}>Doesn't Matter</option>
                {Object.keys(KUL_OPTIONS).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>

              {/* Gothra  */}
              <div className="prefs-row-inline">
                <div className="dropdown-wrapper">
                  <div
                    className={`dropdown-header ${(!selectedKul || selectedKul === DOESNT || kuls.includes(DOESNT)) ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!selectedKul || selectedKul === DOESNT || kuls.includes(DOESNT)) return;
                      setTempGothras(prev => ({
                        ...prev,
                        [selectedKul]: prev[selectedKul] ? prev[selectedKul] : (selectedGothras[selectedKul] ? [...selectedGothras[selectedKul]] : [])
                      }));
                      setShowGothra(prev => !prev);
                    }}
                  >
                    {kuls.includes(DOESNT)
                      ? "Disabled"
                      : (tempGothras[selectedKul]?.length > 0
                        ? `${tempGothras[selectedKul].length} selected`
                        : "Select Gothra")}
                  </div>

                  {showGothra && selectedKul && selectedKul !== DOESNT && !kuls.includes(DOESNT) && (
                    <div className="dropdown-list">
                      <input
                        className="search-input"
                        placeholder={`Search in ${selectedKul}...`}
                        value={gothraSearch}
                        onChange={(e) => setGothraSearch(e.target.value)}
                      />
                      <div className="select-all-row">
                        <label className="select-all-wrap">
                          <input
                            type="checkbox"
                            checked={
                              Object.prototype.hasOwnProperty.call(selectedGothras, selectedKul) &&
                              selectedGothras[selectedKul].length === 0
                            }
                            onChange={() => {
  setSelectedGothras(prev => ({
    ...prev,
    [selectedKul]: []
  }));

  setTempGothras(prev => ({
    ...prev,
    [selectedKul]: []
  }));
  setKuls(prev => {
    if (prev.includes(selectedKul)) return prev;
    return [...prev, selectedKul];
  });

  setShowGothra(false);
}}
                          />
                          <span className="gothra-label-text">Doesn't Matter</span>
                        </label>
                      </div>
                      <div className="gothra-list">
                        {(KUL_OPTIONS[selectedKul] || [])
                          .filter((g) => g.toLowerCase().includes((gothraSearch || "").toLowerCase()))
                          .map((g) => (
                            <label key={g} className="dropdown-item">
                              <input
                                type="checkbox"
                                checked={(tempGothras[selectedKul] || selectedGothras[selectedKul] || []).includes(g)}
                                onChange={() => {

  handleTempGothraToggle(selectedKul, g);

  setTimeout(() => {

    const updated =
      tempGothras[selectedKul] || [];

    setSelectedGothras(prev => ({
      ...prev,
      [selectedKul]: updated.includes(g)
        ? updated.filter(x => x !== g)
        : [...updated, g]
    }));

  }, 0);
}}
                              />
                              <span className="gothra-label-text">{g}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Doesn't Matter chip */}
              {kuls.includes(DOESNT) && (
                <div className="prefs-tag" style={{ marginTop: 12 }}>
                  <strong className="kul-name">Doesn't Matter:</strong>
                  <div className="selected-tags" style={{ marginLeft: 8 }}>
                    <div className="selected-tag">
                      (All Gothras)
                      <button className="selected-remove" onClick={() => setKuls([])}>✕</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Kul/Gothra chips */}
              <div className="kul-selected-block" style={{ marginTop: 12 }}>
                {Object.entries(selectedGothras).map(([kul, goths]) => (
                  <div key={kul} className="prefs-tag">
                    <strong className="kul-name">{kul}:</strong>
                    <div className="selected-tags" style={{ marginLeft: 8 }}>
                      {(!goths || goths.length === 0) ? (
                        <div className="selected-tag">
                          All Gothras
                          <button className="selected-remove" onClick={() => removeKulAll(kul)}>✕</button>
                        </div>
                      ) : (
                        goths.map((g) => (
                          <div key={g} className="selected-tag">
                            {g === "Other" ? (otherGotra || "Other") : g}
                            <button className="selected-remove" onClick={() => removeGothra(kul, g)}>✕</button>
                          </div>
                        ))
                      )}
                      <button type="button" className="prefs-remove" onClick={() => removeKulAll(kul)} aria-label={`Remove ${kul}`} style={{ marginLeft: 8 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Gothra input */}
            {(Object.values(selectedGothras).flat().includes("Other") || Object.values(tempGothras).flat().includes("Other")) && (
              <div className="prefs-row" style={{ marginTop: 12 }}>
                <input
                  className="prefs-control prefs-full"
                  placeholder="Enter Gothra"
                  value={otherGotra}
                  onChange={(e) => setOtherGotra(e.target.value)}
                />
              </div>
            )}

            {/* ── Other preferences ── */}
<h3 className="prefs-sub">Other preferences <span className="required">*</span></h3>
<div className="prefs-row two-cols">
  <div className="prefs-field">
    <label className="prefs-label">Education Level <span className="required">*</span></label>
    <select className="prefs-select prefs-full" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}>
      <option value="" disabled hidden>Select</option>
      <option>SSLC/PU</option>
      <option>Graduate</option>
      <option>Post Graduate</option>
      <option>Doctorate</option>
      <option>Other</option>
    </select>
  </div>
  <div className="prefs-field">
    <label className="prefs-label">Marital Status <span className="required">*</span></label>
    <select className="prefs-select prefs-full" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
      <option value="" disabled hidden>Select</option>
      <option>Single</option>
      <option>Divorced</option>
      <option>Widowed</option>
    </select>
  </div>
</div>

<div className="prefs-row two-cols">
  <div className="prefs-field">
    <label className="prefs-label">Smoking <span className="required">*</span></label>
    <select className="prefs-select prefs-full" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
      <option value="" disabled hidden>Select</option>
      <option>No</option>
      <option>Yes</option>
    </select>
  </div>
  <div className="prefs-field">
    <label className="prefs-label">Drinking <span className="required">*</span></label>
    <select className="prefs-select prefs-full" value={drinking} onChange={(e) => setDrinking(e.target.value)}>
      <option value="" disabled hidden>Select</option>
      <option>No</option>
      <option>Yes</option>
      <option>Social Drinker</option>
    </select>
  </div>
</div>
            {error && <p className="prefs-error">{error}</p>}
            <button
            onClick={submit}
            disabled={loading || !isFormValid}
            className={`prefs-primary ${(!isFormValid || loading) ? "disabled-btn" : ""}`}
          >
            {loading ? "Saving..." : "Save & Continue"}
            </button>
            {minAge &&
 Number(minAge) <
   (gender?.toLowerCase() === "Male" ? 18 : 21) && (
  <div className="prefs-error">
    Minimum age should be greater than or equal to{" "}
    {gender?.toLowerCase() === "Male" ? 18 : 21}
  </div>

)}

{maxAge && Number(maxAge) < 18 && (
  <div className="prefs-error">
    Maximum age should be greater than or equal to 18
  </div>
)}

          </div>
        </div>
      </div>
    </>
  );
}