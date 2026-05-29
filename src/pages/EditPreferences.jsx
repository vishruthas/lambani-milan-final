import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateUserProfile } from "../services/api";
import districtsData from "../data/districts.json";
import logo from "../assets/logo2.webp";
import "./EditPreferences.css";

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

export default function EditPreferences() {
  const navigate = useNavigate();

  const [prefData, setPrefData] = useState({ kul: [], gothra: [], locations: {} });

  /* SEARCH STATES */
  const [stateSearch, setStateSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [gothraSearch, setGothraSearch] = useState("");
  const [tempDistricts, setTempDistricts] = useState({});

  /* DROPDOWN CONTROL */
  const [showStates, setShowStates] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [showGothra, setShowGothra] = useState(false);
  
  const stateRef = useRef(null);
  const districtRef = useRef(null);
  const gothraRef = useRef(null);
  const [warning, setWarning] = useState("");

  /* SELECTION */
  const [state, setState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedKul, setSelectedKul] = useState("");
  const [selectedGothras, setSelectedGothras] = useState({});
  const [tempGothras, setTempGothras] = useState({});
  const isScrolling = useRef(false);
  const [gothraPlaceholder, setGothraPlaceholder] = useState("Select Gothra");
  const [districtPlaceholder, setDistrictPlaceholder] = useState("Select District");


  useEffect(() => { load(); }, []);

async function load() {
    const res = await getMyProfile();
    const data = res.profile;
    const groupedLocations = (data.preferences?.preferredLocations || []).reduce((acc, loc) => {
  if (!acc[loc.state]) acc[loc.state] = [];
   if (
  !loc.district ||
  loc.district?.id === "ALL" ||
  loc.district?.name === "ALL"
) {
  acc[loc.state] = [];
} else {
  acc[loc.state].push(loc.district);
}
  return acc;
}, {});

/* PREF DATA */
  const kulGothra = data.preferences?.preferredKulGothra || [];

const grouped = {};
const kulList = [];

kulGothra.forEach(entry => {
  kulList.push(entry.kul);
  grouped[entry.kul] = entry.gothra.includes("Doesn't Matter")
    ? []
    : entry.gothra;
});

setSelectedGothras(grouped);

setPrefData({
  minAge: data.preferences?.minAge || "",
  maxAge: data.preferences?.maxAge || "",
  educationLevel: data.preferences?.educationLevel || "",
  preferredMaritalStatus: data.preferences?.preferredMaritalStatus || "",
  smoking: data.preferences?.smoking || "",
  drinking: data.preferences?.drinking || "",
  locations: groupedLocations,
  kul: kulList
});

  }

  /* OUTSIDE CLICK */

  useEffect(() => {
  function handleClickOutside(e) {
    if (gothraRef.current && !gothraRef.current.contains(e.target)) {
      setShowGothra(false);
      setGothraPlaceholder("Select Gothra");
      setGothraSearch("");
      setSelectedKul("");
    }

    if (districtRef.current && !districtRef.current.contains(e.target)) {
      setShowDistricts(false);
      setDistrictPlaceholder("Select District");
      setDistrictSearch("");
      setState("");
    }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

/* SCROLL HANDLER */

useEffect(() => {
  const handleScroll = () => {
    isScrolling.current = true;

    setTimeout(() => {
      isScrolling.current = false;
    }, 150);
  };

  window.addEventListener("scroll", handleScroll, true);

  return () => {
    window.removeEventListener("scroll", handleScroll, true);
  };
}, []);

/* PREF LOCATIONS */

useEffect(() => {
  if (state && prefData.locations?.[state]) {
    setSelectedDistricts(prefData.locations[state]);
  } else {
    setSelectedDistricts([]);
  }
}, [state, prefData.locations]);

/* GOTHRA TOGGLE */

const handleTempGothraToggle = (kul, g) => {
  setTempGothras(prev => {
    const existing = prev[kul] || [];

    if (g === "Doesn't Matter") {
      return { ...prev, [kul]: [] };
    }

    const updated = existing.includes(g)
      ? existing.filter(x => x !== g)
      : [...existing.filter(x => x !== "Doesn't Matter"), g];

    return { ...prev, [kul]: updated };
  });
};
 
/* KUL HANDLER */

const handleKulAdd = () => {
  if (!selectedKul) return;

  if (selectedKul === "Doesn't Matter") {
    setPrefData(prev => ({ ...prev, kul: ["Doesn't Matter"] }));
    setSelectedGothras({});
    return;
  }

  setPrefData(prev => ({
    ...prev,
    kul: [...new Set([...(prev.kul || []), selectedKul])]
  }));
  setSelectedKul("");
  setGothraPlaceholder("Select Gothra");
};

useEffect(() => {
  const flat = Object.values(selectedGothras).flat();
  if (JSON.stringify(flat) === JSON.stringify(prefData.gothra))
    return;

  setPrefData(prev => ({
    ...prev,
    gothra: flat
  }));
}, [selectedGothras]);

 /* ADD GOTHRA */

const handleGothraAdd = (kul) => {
  setSelectedGothras(prev => ({
    ...prev,
    [kul]: tempGothras[kul] || []
  }));

  setTempGothras(prev => ({ ...prev, [kul]: [] }));
  setShowGothra(false);
  setGothraSearch("");
};

/* REMOVE GOTHRA */

const removeGothra = (kul, g) => {
  setSelectedGothras(prev => {
    const updated = (prev[kul] || []).filter(x => x !== g);

    if (updated.length === 0) {
      const newObj = { ...prev };
      delete newObj[kul];
      return newObj;
    }

    return { ...prev, [kul]: updated };
  });
};

/* CONFIRM REMOVE */

function proceedAddKul() {
  const gothras = tempGothras[selectedKul] || [];

  setSelectedGothras(prev => ({
    ...prev,
    [selectedKul]: gothras
  }));

  setPrefData(prev => ({
    ...prev,
    kul: [...new Set([...(prev.kul || []), selectedKul])],
    gothra: [
      ...new Set([
        ...(prev.gothra || []),
        ...gothras
      ])
    ]
  }));
}

/* HANDLE DISTRICT */

const handleDistrictToggle = (districtName) => {
  setSelectedDistricts(prev => {
    const exists = prev.some(d => d.name === districtName);

    if (exists) {
      return prev.filter(d => d.name !== districtName);
    } else {
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: districtName,
          state: state
        }
      ];
    }
  });
};




/* ADD LOCATION */

const addLocation = () => {
  if (!state) {
    alert("Select state");
    return;
  }

  setPrefData(prev => {
    const existing = prev.locations?.[state] || [];

    if (selectedDistricts.length === 0) {
      return {
        ...prev,
        locations: {
          ...prev.locations,
          [state]: []
        }
      };
    }

    const newDists = selectedDistricts
      .filter(d => !existing.some(e => e.name === d.name))
      .map(d => ({
        name: d.name,
        state: state
      }));

    return {
      ...prev,
      locations: {
        ...prev.locations,
        [state]: [...existing, ...newDists]
      }
    };
  });

  // RESET
  setState("");
  setSelectedDistricts([]);
  setDistricts([]);
  setShowDistricts(false);
};

/* SAVE PREFERNCES */

  async function savePreferencesData() {
    if (
        prefData.minAge &&
        prefData.maxAge &&
        prefData.minAge >= prefData.maxAge
    ) {
        setWarning("Min age should be less than Max age");
        return;
    }
  try {
    await updateUserProfile({
      preferences: {
        minAge: prefData.minAge,
        maxAge: prefData.maxAge,
        educationLevel: prefData.educationLevel,
        preferredMaritalStatus: prefData.preferredMaritalStatus,
        smoking: prefData.smoking,
        drinking: prefData.drinking,

        preferredKulGothra: prefData.kul.includes("Doesn't Matter")
      ? [{
        kul: "Doesn't Matter",
        gothra: ["Doesn't Matter"]
      }]
    : Object.entries(selectedGothras).map(([kul, goths]) => ({
        kul,
        gothra:
          goths.length === 0
            ? ["Doesn't Matter"]
            : goths
      })),

        preferredLocations: Object.entries(prefData.locations || {}).flatMap(
          ([state, dists]) => {
            if (!dists || dists.length === 0) {
              return [
                {
                  state,
                  district: {
                    id: "ALL",
                    name: "ALL",
                    state
                  }
                }
              ];
            }
            return dists.map(d => ({
              state,
              district:
                typeof d === "string"
                  ? { 
                    id: Date.now().toString(),
                    name: d, 
                    state }
                  : {
                    id: d.id || Date.now().toString(),
                    name: d.name,
                    state: d.state || state
                  }
            }));
          }
        )
      }
    });

    navigate("/profile");

  } catch (err) {
    console.error("Preferences update failed:", err);
    alert("Failed to update preferences");
  }}

  return (
  <div className="page5-wrapper5">

    {/* HEADER */}
    <div className="headerpref">
          
      <div className="header-centerpref">
        <img src={logo} alt="logo" className="logo" />
            <div className="title">Lambani Milan</div>
      </div>
    </div>
    <div className="pref-header">

   <button className="pref-back-btn" onClick={() => navigate("/profile")} aria-label="Go back to profile">
    &#8592;
  </button>

      <div className="pref-title-wrap">

        <h2 className="pref-heading">
            Edit Your Preferences
        </h2>

        <p className="pref-desc">
           Set your preferences and partner expectations.
        </p>

      </div>
    </div>


  <div className="page5-full5">
    <div className="page5">
      <div className="grid5">

        {/* AGE */}
        <div className="col-65">
          <div className="field5">
            <label className="label5">Min Age</label>
            <input
              className="input5"
              type="number"
              value={prefData.minAge || ""}
              onChange={e =>
                setPrefData({ ...prefData, minAge: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="col-65">
          <div className="field5">
            <label className="label5">Max Age</label>
            <input
              className="input5"
              type="number"
              value={prefData.maxAge || ""}
              onChange={e =>
                setPrefData({ ...prefData, maxAge: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/*  KUL + GOTHRA  */}
        <div className="full-row5">
          <div className="panel5">
            <div className="panel-header5">
              <label className="label5">Preferred Kul and Gothra </label>
            </div>

            <div className="panel-body5">
              <div className="pref-row5">

              {/* KUL */}
              <div className="row5">
                <div className="dropdown5" style={{ width: "100%" }}>
                  <select
                    className="input5"
                    style={{ width: "100%" }}
                    value={selectedKul}
                    onChange={(e) => {
  const val = e.target.value;

  setSelectedKul(val);
  if (val !== "Doesn't Matter") {

  setSelectedGothras(prev => {
    const updated = { ...prev };
    delete updated["Doesn't Matter"];
    return updated;
  });

  setPrefData(prev => ({
    ...prev,
    kul: (prev.kul || []).filter(k => k !== "Doesn't Matter")
  }));
}
  setShowGothra(false);
  setGothraSearch("");

  if (val === "Doesn't Matter") {

    setSelectedGothras({
      "Doesn't Matter": []
    });

    setPrefData(prev => ({
      ...prev,
      kul: ["Doesn't Matter"],
      gothra: []
    }));

    setGothraPlaceholder("Select Gothra");
  }
}}
                  >
                    <option value="">Select Kul</option>
                    <option value="Doesn't Matter">Doesn't Matter</option>
                    {Object.keys(KUL_OPTIONS).map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GOTHRA + ADD */}
              <div className="row5" >
                <div className="dropdown5" style={{ flex: 1, minWidth: 0 }} ref={gothraRef}>

                  <div
                    className={`dropdown-header5 ${
                      (!selectedKul || selectedKul === "Doesn't Matter") ? "disabled5" : ""
                    }`}
                    onClick={() => {
                      if (!selectedKul) return;
                      if (selectedKul === "Doesn't Matter") {
                        setTempGothras(prev => ({
                          ...prev,
                          [selectedKul]: []
                        }));
                        setShowGothra(false);
                        return;
                      }
                      setShowGothra(prev => {
  const next = !prev;

  setGothraPlaceholder(
    next
      ? (
          selectedGothras[selectedKul]?.length > 0
            ? `${selectedGothras[selectedKul].length} selected`
            : selectedGothras[selectedKul]
              ? "All Gothras"
              : "Select Gothra"
        )
      : "Select Gothra"
  );

  return next;
});

                      setTempGothras(prev => ({
                        ...prev,
                        [selectedKul]: selectedGothras[selectedKul] ?? []
                      }));
                    }}
                  >
                    <span>{gothraPlaceholder}</span>

                    <span className="dropdown-arrow5">
                      {showGothra ? "▲" : "▼"}
                    </span>
                  </div>

                  {showGothra &&
                    selectedKul &&
                    selectedKul !== "Doesn't Matter" && (
                      <div className="dropdown-panel5" onWheel={(e) => e.stopPropagation()}>

                        <input
                          className="input5"
                          placeholder="Search..."
                          value={gothraSearch}
                          onChange={(e) => setGothraSearch(e.target.value)}
                        />

                        <label className="dropdown-item5">
                          <input
                            type="checkbox"
                            checked={(
                              tempGothras[selectedKul] ??
                              selectedGothras[selectedKul] ??
                              []
                            ).length === 0}
                            onChange={() => {
  setTempGothras(prev => ({
    ...prev,
    [selectedKul]: []
  }));

  setSelectedGothras(prev => ({
    ...prev,
    [selectedKul]: []
  }));

  setPrefData(prev => ({
    ...prev,
    kul: [...new Set([...(prev.kul || []), selectedKul])]
  }));
  setSelectedKul("");
setGothraPlaceholder("Select Gothra");
}}
                          />
                          Doesn't Matter
                        </label>

                        {KUL_OPTIONS[selectedKul]
                          ?.filter(g =>
                            g.toLowerCase().includes(gothraSearch.toLowerCase())
                          )
                          .map(g => (
                            <label key={g} className="dropdown-item5">
                              <input
                                type="checkbox"
                                checked={
                                  (
                                    tempGothras[selectedKul] ||
                                    selectedGothras[selectedKul] ||
                                    []
                                  ).includes(g)
                                }
                                onChange={() => {
  handleTempGothraToggle(selectedKul, g);

  setTimeout(() => {
    const updated =
      (
        tempGothras[selectedKul] ||
        selectedGothras[selectedKul] ||
        []
      ).includes(g)
        ? (
            tempGothras[selectedKul] ||
            selectedGothras[selectedKul] ||
            []
          ).filter(x => x !== g)
        : [
            ...(
              tempGothras[selectedKul] ||
              selectedGothras[selectedKul] ||
              []
            ),
            g
          ];

    setSelectedGothras(prev => ({
      ...prev,
      [selectedKul]: updated
    }));

    setPrefData(prev => ({
      ...prev,
      kul: [...new Set([...(prev.kul || []), selectedKul])],
      gothra: [
        ...new Set([
          ...(prev.gothra || []),
          ...updated
        ])
      ]
    }));  

  }, 0);
}}
                              />
                              {g}
                            </label>
                          ))}
                      </div>
                    )}
                </div>
              </div>
              </div>

        {/* DOESN'T MATTER DISPLAY */}
        {prefData.kul?.includes("Doesn't Matter") && (
          <div className="chip-list5">
            <div className="chip5">
              <strong>Doesn't Matter:</strong>
              <span style={{ marginLeft: 6 }}>
                All Kul & Gothras
              </span>
              <span 
              className="small-remove5" 
              style={{ marginLeft: 8 }}
              onClick={() => {
                 setPrefData(prev => ({ ...prev, kul: [] }));
                 setSelectedGothras({});
              }}
              >
                ×
                </span>
            </div>
          </div>
        )}

        {/*  KUL & GOTHRA */}
        <div className="chip-list5" style={{ marginTop: 12 }}>
          {Object.entries(selectedGothras)
            .filter(([kul]) => kul !== "Doesn't Matter")
            .map(([kul, goths]) => (
              <div key={kul} className="location-block5">
                <div className="chip5">

                  <strong>{kul}:</strong>

                  <div className="inline-chips5">
                    {kul == "Doesn't Matter" ? null : goths.length === 0 ? (
                      <div className="small-chip5">
                        All Gothras
                        <span
                          className="small-remove5"
                          onClick={() => {
                            setSelectedGothras(prev => {
                              const newObj = { ...prev };
                              delete newObj[kul];
                              return newObj;
                            });
                          }}
                        >×</span>
                      </div>

                    ) : (
                      goths.map((g, i) => (
                        <div key={kul + "-" + (g || i)} className="small-chip5">
                          {g}
                          <span
                            className="small-remove5"
                            onClick={() => {
                              setSelectedGothras(prev => {
                                const updated = (prev[kul] || []).filter(x => x !== g);
                                if (updated.length === 0) {
                                  const newObj = { ...prev };
                                  delete newObj[kul];
                                  return newObj;
                                }
                                return { ...prev, [kul]: updated };
                              });
                            }}
                          >×</span>
                        </div>
                      ))
                    )}
                  </div>

                  {kul !== "Doesn't Matter" && (
                    <span
                      className="small-remove5 remove-state5"
                      onClick={() => {
                        setSelectedGothras(prev => {
                          const newObj = { ...prev };
                          delete newObj[kul];
                          return newObj;
                        });
                      }}
                    >×</span>
                  )}

                </div>
              </div>
            ))}
        </div>
            </div>
          </div>
        </div>


        <div className="full-row5" style={{ marginTop: 12 }}>
          <div className="panel5" ref={districtRef}>
            <div className="panel-header5">
              <label className="label5">Preferred Locations</label>
            </div>

            <div className="panel-body5">
              <div className="pref-row5">
              <div className="row5">
                <div className="dropdown5" style={{ width: "100%" }}>
                  <select
                    className="input5" style={{ width: "100%" }}
                    value={state}
                    onChange={(e) => {
                      const val = e.target.value;
                      setState(val);
                      setShowDistricts(false);
                      setDistrictSearch("");
                      setDistricts(districtsData[val] || []);
                      setTempDistricts(prev => ({ ...prev, [val]: prev[val] || [] }));
                    }}
                  >
                    <option value="">Select State</option>

                    {Object.keys(districtsData).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* DISTRICT + ADD  */}
              <div className="row5">
                <div className="districts-select5" style={{ flex: 1, minWidth: 0 }}>
                  <div className="dropdown5" style={{ width: "100%" }}>
                    <div
                      className={`dropdown-header5 ${(!state || state === "Doesn't Matter") ? "disabled5" : ""}`}
                      onClick={() => {
                        if (!state) return;
                        setShowDistricts(prev => {
  const next = !prev;

  setDistrictPlaceholder(
    next
      ? (
          prefData.locations?.[state]
            ? prefData.locations[state].length === 0
              ? "All Districts"
              : `${prefData.locations[state].length} selected`
            : "Select District"
        )
      : "Select District"
  );

  return next;
});
                        setTempDistricts(prev => ({
                        ...prev,
                        [state]:
                        prev[state]?.length
                        ? prev[state]
                        : (prefData.locations?.[state] || []).map(d =>
                        typeof d === "string" ? d : d.name
                        )
                      }));
                        if (!districts.length) {
                          setDistricts(districtsData[state] || []);
                        }
                      }}
                    >
                      <span>{districtPlaceholder}</span>
                      <span className="dropdown-arrow5">{showDistricts ? "▲" : "▼"}</span>
                    </div>

                    {showDistricts && state &&  (
                      <div className="dropdown-panel5" onWheel={(e) => e.stopPropagation()}>
                        <input
                          className="input5"
                          placeholder="Search district"
                          value={districtSearch}
                          onChange={(e) => setDistrictSearch(e.target.value)}
                        />

                        <label className="dropdown-item5">
                          <input
                            type="checkbox"
                            checked={(tempDistricts[state] || []).length === 0}
                            onChange={() => {
  setTempDistricts(prev => ({
    ...prev,
    [state]: []
  }));

  setPrefData(prev => ({
    ...prev,
    locations: {
      ...(prev.locations || {}),
      [state]: []
    }
  }));
}}
                          />
                          Doesn't Matter
                        </label>

                        {(districts || [])
                          .filter(d => !districtSearch || d.toLowerCase().includes(districtSearch.toLowerCase()))
                          .map(d => (
                            <label key={d} className="dropdown-item5">
                              <input
                                type="checkbox"
                                checked={(tempDistricts[state] || []).some(
                                district =>
                                (typeof district === "string"
                                ? district
                                : district?.name) === d
                              )}
                                onChange={() => {
  setTempDistricts(prev => {
    const list = prev[state] || [];
    const exists = list.includes(d);

    const updated = exists
      ? list.filter(x => x !== d)
      : [...list, d];

    const districtsToAdd = updated.map(item => ({
      name: item,
      state: state
    }));

    setPrefData(prevData => ({
      ...prevData,
      locations: {
        ...(prevData.locations || {}),
        [state]: districtsToAdd
      }
    }));
    return {
      ...prev,
      [state]: updated
    };
  });
}}
                              />
                              {d}
                            </label>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>

              <div className="chip-list5" style={{ marginTop: 12 }}>
                {Object.entries(prefData.locations || {}).map(([stateName, dists]) => (
                  <div key={stateName} className="location-block5">
                    <div className="chip5">
                      <strong>{stateName}:</strong>
                      <div className="inline-chips5">
                        {dists.length === 0 ? (
                          <div className="small-chip5">
                            All Districts
                            <span className="small-remove5" onClick={() => {
                              setPrefData(prev => {
                                const newLocations = { ...(prev.locations || {}) };
                                delete newLocations[stateName];
                                return { ...prev, locations: newLocations };
                              });
                            }}>×</span>
                          </div>
                        ) : (
                          dists.map((d, i) => (
                            <div key={stateName + "-" + (d?.name || i)} className="small-chip5">
                              {d?.name}
                              <span className="small-remove5" onClick={() => {
                                setPrefData(prev => {
                                  const newLocations = { ...(prev.locations || {}) };
                                  const updated = (newLocations[stateName] || []).filter((_, index) => index !== i);
                                  if (updated.length === 0) {
                                    delete newLocations[stateName];
                                  } else {
                                    newLocations[stateName] = updated;
                                  }
                                  return { ...prev, locations: newLocations };
                                });
                              }}>×</span>
                            </div>
                          ))
                        )}
                      </div>

                      <span className="small-remove5 remove-state5" onClick={() => {
                        setPrefData(prev => {
                          const newLocations = { ...(prev.locations || {}) };
                          delete newLocations[stateName];
                          return { ...prev, locations: newLocations };
                        });
                      }}>×</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
                 
        <div className="col-65">
          <div className="field5">
            <label className="label5">Education Level</label>
            <select className="input5" value={prefData.educationLevel || ""} onChange={e => setPrefData({ ...prefData, educationLevel: e.target.value })}>
              <option value="">Select</option>
              {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="col-65">
          <div className="field5">
            <label className="label5">Marital Status</label>
            <select className="input5" value={prefData.preferredMaritalStatus || ""} onChange={e => setPrefData({ ...prefData, preferredMaritalStatus: e.target.value })}>
              <option value="">Select</option>
              {MARITAL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="col-65">
          <div className="field5">
            <label className="label5">Smoking</label>
            <select className="input5" value={prefData.smoking || ""} onChange={e => setPrefData({ ...prefData, smoking: e.target.value })}>
              <option value="">Select</option>
              {YES_NO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="col-65">
          <div className="field5">
            <label className="label5">Drinking</label>
            <select className="input5" value={prefData.drinking || ""} onChange={e => setPrefData({ ...prefData, drinking: e.target.value })}>
              <option value="">Select</option>
              {DRINK_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

      </div>

      {warning && (
        <div className="overlay5">
          <div className="popup5">
            <p>{warning}</p>
            <button className="ok-btn5" onClick={() => {
              if (confirmAction) confirmAction();
              setWarning("");
              setConfirmAction(null);
            }}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="btnRow5">
        <button className="btn5" onClick={savePreferencesData}>Save</button>
        <button className="btn5 btn-secondary5" onClick={() => navigate("/profile")}>Cancel</button>
      </div>

    </div>
  </div>
</div>
  );
}