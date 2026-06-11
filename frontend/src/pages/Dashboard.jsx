import React, { useState, useEffect, useMemo } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Flame,
  Thermometer,
  Scale,
  Activity,
  ArrowRight,
  Clock,
  Info,
  Layers,
  Database,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
  History,
  TrendingDown,
  Download,
  ShieldCheck,
  Plus,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Treemap,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { documentApi } from '../services/api';

// Curated industrial color palette
const COLORS = {
  orange: "#f97316", // Primary Accent
  cyan: "#06b6d4",
  indigo: "#6366f1",
  teal: "#14b8a6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  slate: "#64748b"
};

const PIE_COLORS = [COLORS.orange, COLORS.cyan, COLORS.indigo, COLORS.teal, COLORS.amber, COLORS.rose];

// Custom Treemap Node Renderer for Recharts
const TreemapNode = (props) => {
  const { x, y, width, height, name, value, fill } = props;
  if (width < 30 || height < 20) return null;
  const displayVal = value !== undefined ? value : 0;
  const fillColor = fill || "#f97316";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#fff',
          strokeWidth: 1.5,
          opacity: 0.9,
        }}
      />
      {width > 60 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={10}
          fontWeight="bold"
        >
          {name}
        </text>
      )}
      {width > 60 && height > 55 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.85)"
          fontSize={9}
          fontFamily="monospace"
        >
          {displayVal.toLocaleString()} kg
        </text>
      )}
    </g>
  );
};

const PROCESS_FLOW_STEPS = [
  {
    stage: "Moulding",
    description: "Creating the sand mould top & bottom sections.",
    materials: "Silica Sand, Chromite Sand, Sinotherm Binder, Activator Catalyst",
    costEstimate: "Silica: $0.15/kg, Chromite: $0.65/kg, Binder: $1.80/kg. Avg: ~$850 / heat.",
    risk: "MED - Sand density and binder ratios must prevent expansion defects."
  },
  {
    stage: "Core Making",
    description: "Shaping internal cavities and passages using cores.",
    materials: "Sinotherm Binder, Silica Sand, Core Sleeves, Venting Tubes",
    costEstimate: "Resin binder systems + sand: ~$320 per heat.",
    risk: "LOW - Core gas venting must be sufficient to prevent blowholes."
  },
  {
    stage: "Pouring",
    description: "Tapping the induction furnace and pouring liquid steel into the sand mould.",
    materials: "Liquid Steel (ASTM A995 Gr. 6A or WCB Alloy)",
    costEstimate: "Liquid steel alloy components: ~$1,450 to $3,800 depending on grade.",
    risk: "HIGH - Tapping vs. pouring temperature mismatch causes thermal cracks and shrinkage."
  },
  {
    stage: "Cooling",
    description: "Controlled solidification of the metal within the sand mould.",
    materials: "N/A (Ambient cooling inside yard)",
    costEstimate: "Yard space overhead: ~$120/hr log basis.",
    risk: "MED - Hot tearing can occur if cooling is too rapid or restraint is high."
  },
  {
    stage: "Inspection",
    description: "Shakeout, sand removal, and initial visual & dye penetrant surface inspection.",
    materials: "Dye Penetrant developer kits, blasting media",
    costEstimate: "Visual inspection hours & DPI solvents: ~$180.",
    risk: "LOW - Surface cracks or sand inclusion are easily detected here."
  },
  {
    stage: "QA Tests",
    description: "Destructive and non-destructive testing of integral test bars.",
    materials: "Test coupons, NDT RT radiographic plates",
    costEstimate: "Radiographic testing & tensile coupon milling: ~$650.",
    risk: "HIGH - Yield loss if tensile bars fail specs, requiring full heat scrap."
  }
];


// Premium mock data for Moulding cycle logs to use if DB is empty
const MOCK_MOULDING_DOCUMENTS = [
  {
    task_id: "mould_1",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "UA/F/PP/01", planning_date: "09.05.2026", heat_no: "B23722-05", pouring_date: "10.05.2026" },
      product_details: {
        description: "STG CASE GPD 8X6X14 1/2 217",
        customer: "RUHRPUMPEN INDIA (P) LTD",
        grade: "6A",
        casting_weight: "184.000",
        liquid_weight: "330.000",
        qty: "2.000",
        sample_bulk: "Bulk",
        finish_type: "Raw Casting",
        pattern_code: "1020184Z",
        pattern_serial_no: "126",
        pattern_type: "MOUNT",
        drawing_number: "7121080016/B",
        part_no: "W641745500-99",
        pcs_in_box: "00000",
        no_of_core_boxes: "0",
        no_of_cores: "0",
        method_remarks: ""
      },
      qa_parameters: [
        "DPI RGT",
        "QA PARAMETERS: SPECIFICATION-ASTM A995-2021 GR.6A",
        "TDC REQUIRED",
        "MTC-3.1",
        "SPECIAL CHEMISTRY REQUIRED",
        "TENSILE TEST REQUIRED",
        "IMPACT TEST REQUIRED-CVN 2MM AT 46°C, MIN 35J AVG 45J",
        "MICRO TEST REQUIRED-A923 METHOD A AT 400X",
        "FERRITE TEST REQUIRED-AS PER E562 35 TO 65%",
        "IGCT TEST REQUIRED-G48 METHOD A, 50°C, 24HRS, 1.0G/M² MAX",
        "PREN AND CF-PREN WITH W=40.0 MIN, CF=35.00 MIN",
        "INTEGRAL TEST BAR REQUIRED",
        "NDT PARAMETERS:",
        "RT ON CRITICAL AREA",
        "DPI TEST REQUIRED",
        "DIMENSION TEST INTERNAL",
        "VISUAL INSPECTION:MSS-SP-55"
      ],
      moulding_details: {
        top: { contractor: "LP", moulder: "Jothi", moulding_date: "8/5/26", moulding_time: "7:30pm", coating_details: "Sparklex 100A Isomol", coating_date: "8/5/26", coating_time: "10:40pm" },
        bottom: { contractor: "LP", moulder: "vengatesh", moulding_date: "8/5/26", moulding_time: "8:00pm", coating_details: "Sparklex 100A Isomol", coating_date: "8/5/26", coating_time: "11:00pm" }
      },
      inspection_parameters: {
        pattern_finishing: "Yes",
        process: "CO2/Noback",
        chill_size_thickness: "Ensured ok",
        chill_slot_blasted: "Yes",
        chill_finishing: "checked ok",
        sleeve_size_oven: "checked ok & 110°",
        refactory_sleeve: "checked ok",
        lettering_checking: "checked ok",
        mould_checking: "checked ok"
      },
      refractory_sleeve_and_sand_consumption: {
        notes: "LP - 2NO, Nobake Process, Ivp Resin & Activator",
        top: { chromite_sand: "60", silica_sand: "1815", sinotherm: "39", activator: "8", sparklex_100a_isomol: "6.400" },
        bottom: { chromite_sand: "30", silica_sand: "907", sinotherm: "20", activator: "4", sparklex_100a_isomol: "3.200" }
      },
      materials_table: [
        { sle_code: "100001", sle_name: "1000X1000X250 TOP", slv_qty: "387.000", actual_qty: "" },
        { sle_code: "100002", sle_name: "1000X1000X200 BOTTOM", slv_qty: "310.000", actual_qty: "" },
        { sle_code: "200160", sle_name: "40 MM ST SLEEVE (REFRACTORY SLEEVE)", slv_qty: "2.000", actual_qty: "" },
        { sle_code: "200161", sle_name: "40 MM L BEND (REFRACTORY SLEEVE)", slv_qty: "4.000", actual_qty: "" }
      ],
      signatures: {
        planned_by: "Signed",
        pattern_inspected_by: "Unsigned",
        qa_checked_by: "Unsigned",
        core_inspected_by: "Unsigned",
        mould_inspected_by: "Signed",
        closing_inspected_by: "Unsigned",
        pouring_inspected_by: "Unsigned",
        pre_production_inspected_by: "Unsigned"
      }
    }
  }
];

// Custom Glassmorphic Tooltip for Recharts that respects dark/light themes
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl max-w-sm">
        {label && (
          <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold mb-1.5">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.stroke || p.fill }} />
              <span className="text-slate-550 dark:text-slate-400 font-medium">{p.name}:</span>
              <span style={{ color: p.color || p.stroke || p.fill }} className="font-mono font-bold">
                {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Heuristic formatter for property keys
const formatKey = (key) => {
  if (!key) return "";
  const spaced = key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.replace(/\b\w/g, c => c.toUpperCase());
};

// Heuristic formatter for unit display
const formatValue = (value, keyName = "") => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 uppercase tracking-wide">
        Missing
      </span>
    );
  }
  
  const strVal = String(value).trim();
  const lowerKey = keyName.toLowerCase();
  
  if (lowerKey.includes("temp") || lowerKey.includes("temperature")) {
    if (!strVal.includes("°") && !isNaN(parseFloat(strVal))) {
      return `${strVal}°C`;
    }
  }
  if (lowerKey.includes("weight") || lowerKey.includes("tonnage")) {
    if (!strVal.toLowerCase().includes("kg") && !strVal.toLowerCase().includes("ton") && !isNaN(parseFloat(strVal))) {
      return `${strVal} kg`;
    }
  }
  if (lowerKey.includes("sec") || lowerKey.includes("duration") || lowerKey.includes("time")) {
    if (!strVal.toLowerCase().includes("sec") && !strVal.toLowerCase().includes("min") && !strVal.toLowerCase().includes("am") && !strVal.toLowerCase().includes("pm") && !isNaN(parseFloat(strVal))) {
      return `${strVal} sec`;
    }
  }
  
  return strVal;
};

// Enterprise SAP/Fiori Style Dynamic Data Table for Digitized Blocks
function FioriSectionTable({ title, data, icon: Icon }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  if (!data) return null;

  const isArray = Array.isArray(data);
  let rawRows = [];
  let headers = [];

  if (isArray) {
    rawRows = data;
    if (data.length > 0) {
      headers = Object.keys(data[0]);
    }
  } else {
    rawRows = Object.entries(data).map(([k, v]) => ({
      parameter: k,
      value: v
    }));
    headers = ["parameter", "value"];
  }

  // Filter
  const filteredRows = rawRows.filter(row => {
    return Object.values(row).some(val => 
      String(val || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Sort
  const sortedRows = [...filteredRows];
  if (sortField) {
    sortedRows.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (valA !== null && typeof valA === "object") valA = JSON.stringify(valA);
      if (valB !== null && typeof valB === "object") valB = JSON.stringify(valB);
      
      const strA = String(valA || "").toLowerCase();
      const strB = String(valB || "").toLowerCase();
      
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full animate-fade-in">
      
      {/* Table Title and Actions */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="text-[#f97316] shrink-0" size={18} />}
          <span className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider">{title}</span>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
            {sortedRows.length} entries
          </span>
        </div>
        
        {/* Search */}
              <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs px-3 py-1.5 pl-8 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#f97316] w-full sm:w-44 transition-all font-semibold"
          />
          <svg className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
          <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 dark:text-slate-500 uppercase font-bold text-[9px] tracking-wider sticky top-0 backdrop-blur-sm">
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  onClick={() => handleSort(h)}
                  className="px-4 py-3 text-left border-r border-slate-100 dark:border-slate-900/40 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{formatKey(h)}</span>
                    {sortField === h && (
                      sortDirection === "asc" ? " ▴" : " ▾"
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40 text-slate-600 dark:text-slate-350">
            {sortedRows.length > 0 ? (
              sortedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                  {headers.map(h => {
                    const rawVal = row[h];
                    let cellVal = formatValue(rawVal, h);
                    
                    if (rawVal !== null && typeof rawVal === "object" && !Array.isArray(rawVal)) {
                      cellVal = (
                        <div className="space-y-1 py-1 font-mono text-[10px] text-slate-500 leading-relaxed">
                          {Object.entries(rawVal).map(([subK, subV]) => (
                            <div key={subK} className="flex items-baseline gap-1.5">
                              <span className="text-slate-400 font-semibold">{formatKey(subK)}:</span>
                              <span className="text-slate-700 dark:text-slate-300 font-bold">{formatValue(subV, subK)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    } else if (Array.isArray(rawVal)) {
                      cellVal = (
                        <div className="flex flex-wrap gap-1 py-1">
                          {rawVal.map((item, i) => (
                            <span key={i} className="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 rounded text-[9px] text-slate-600 dark:text-slate-350 font-mono">
                              {typeof item === "object" ? JSON.stringify(item) : String(item)}
                            </span>
                          ))}
                        </div>
                      );
                    }
                    
                    const isKeyColumn = !isArray && h === "parameter";
                    return (
                      <td 
                        key={h} 
                        className={`px-4 py-3.5 border-r border-slate-100 dark:border-slate-900/30 ${
                          isKeyColumn 
                            ? "font-bold text-slate-500 dark:text-slate-400 w-1/3 bg-slate-50/20 dark:bg-slate-950/5 uppercase tracking-wide text-[10px]" 
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isKeyColumn ? formatKey(rawVal) : cellVal}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400 dark:text-slate-600 font-medium">
                  No data matches the filter query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard({ activeTab, setActiveTab, activeDocument, setActiveDocument }) {
  // File upload states
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Ingestion Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [nextPageLoading, setNextPageLoading] = useState(false);
  
  // Digitized Viewer Page navigation
  const [activeViewerPage, setActiveViewerPage] = useState(0);
  
  // Interactive Foundry Process Flow step
  const [activeFlowStep, setActiveFlowStep] = useState(0);

  // Database documents list
  const [dbDocuments, setDbDocuments] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  // Load database documents on mount & when switching tabs
  const fetchDbDocuments = async () => {
    setLoadingDb(true);
    try {
      const data = await documentApi.getAllDocuments();
      setDbDocuments(data || []);
    } catch (err) {
      console.error("Failed to load historical documents from DB:", err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbDocuments();
  }, [activeTab]);

  // Reset page index on active document or result change
  useEffect(() => {
    setActiveViewerPage(0);
  }, [result]);

  // Sync historical document selection with view state
  useEffect(() => {
    if (activeDocument && activeDocument.extracted_data) {
      const ext = activeDocument.extracted_data;
      setResult(ext);
      setUploadedFilename(ext.filename || activeDocument.filename || null);
      setTaskId(activeDocument.task_id);
      
      const parsedPages = ext.pages || [ext];
      const pagesCount = parsedPages.length;
      const total = ext.total_pages || pagesCount || 1;
      
      setCurrentPage(pagesCount - 1);
      setTotalPages(total);
      setHasNextPage(pagesCount < total);
    }
  }, [activeDocument]);

  // Fallback dynamic cache: if DB is empty, use the premium pre-loaded moulding mock data
  const allDbDocuments = useMemo(() => {
    if (dbDocuments.length > 0) {
      return dbDocuments;
    }
    return MOCK_MOULDING_DOCUMENTS;
  }, [dbDocuments]);

  // Ingestion handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setUploadedFilename(null);
    setCurrentPage(0);
    setTotalPages(1);
    setHasNextPage(false);
    setTaskId(null);

    try {
      const response = await documentApi.processDocument(file);
      setResult(response.data);
      setUploadedFilename(response.filename);
      setTaskId(response.task_id);
      setCurrentPage(response.current_page ?? 0);
      setTotalPages(response.total_pages ?? 1);
      setHasNextPage(response.has_next_page ?? false);
      
      // Auto redirect to Digitized Viewer to show output!
      setActiveTab('viewer');
      // Refresh DB list
      fetchDbDocuments();
    } catch (err) {
      setError(err.message || "Failed to process document.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessNextPage = async () => {
    if (currentPage >= totalPages - 1) return;
    setNextPageLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      const data = await documentApi.processNextPage(nextPage, uploadedFilename, taskId);
      
      setResult(data.data);
      setCurrentPage(data.current_page ?? nextPage);
      setTotalPages(data.total_pages ?? totalPages);
      setHasNextPage(data.has_next_page ?? false);
      
      // Auto-set the digitized page view index to the newly processed page
      setActiveViewerPage(nextPage);
      
      // Navigate to viewer to show updated page data
      setActiveTab('viewer');
    } catch (err) {
      setError(err.message || "Failed to process next page.");
    } finally {
      setNextPageLoading(false);
    }
  };

  const handleCloseRecord = () => {
    setResult(null);
    setFile(null);
    setUploadedFilename(null);
    setCurrentPage(0);
    setTotalPages(1);
    setHasNextPage(false);
    setTaskId(null);
    setActiveDocument(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await documentApi.exportDocuments();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'manufacturing_records.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export Excel file:", err);
      alert("Failed to export Excel file: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  // -------------------------------------------------------------
  // DATA PARSING & AGGREGATION ALIGNED TO THE BACKEND OUTPUT STRUCTURE
  // -------------------------------------------------------------
  
  // Clean, flat array of all castings across all historical documents
  const allHistoricalPours = useMemo(() => {
    const flatPours = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const date = ext.document_info?.date || ext.document_metadata?.date || "N/A";
      const heatNo = ext.document_info?.heat_no || ext.document_metadata?.heat_no || doc.task_id?.substring(0, 8) || "N/A";
      
      // Formats:
      // 1. Pages list schema (New multi-page format)
      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach((page_data, pIdx) => {
          if (!page_data) return;
          const pageMetadata = page_data.document_metadata || {};
          const pageProd = page_data.product_details || {};
          const pageDate = pageMetadata.planning_date || pageMetadata.date || date;
          const pageHeat = pageMetadata.heat_no || heatNo;
          const castingWeight = parseFloat(String(pageProd.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          const liquidWeight = parseFloat(String(pageProd.liquid_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          
          flatPours.push({
            date: pageDate,
            heatNo: pageHeat,
            grade: pageProd.grade ? String(pageProd.grade).toUpperCase().trim() : "WCB",
            customer: pageProd.customer || "N/A",
            plannedWeight: castingWeight,
            pouredWeight: liquidWeight,
            duration: 0,
            sequence: pIdx + 1,
            deltaTemp: 0
          });
        });
      }
      // 2. Production Plan schema (Our structured layout - single page fallback)
      else if (ext.materials_table || ext.moulding_details) {
        const prod = ext.product_details || {};
        const castingWeight = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const liquidWeight = parseFloat(String(prod.liquid_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        
        flatPours.push({
          date,
          heatNo,
          grade: prod.grade ? String(prod.grade).toUpperCase().trim() : "WCB",
          customer: prod.customer || "N/A",
          plannedWeight: castingWeight,
          pouredWeight: liquidWeight,
          duration: 0,
          sequence: 1,
          deltaTemp: 0
        });
      }
      // 3. table_data (Old format)
      else if (ext.table_data && Array.isArray(ext.table_data)) {
        ext.table_data.forEach((row, idx) => {
          const pouredWeight = parseFloat(String(row.actual_liquid_poured_kg || 0).replace(/[^0-9.]/g, "")) || 0;
          const plannedWeight = parseFloat(String(row.planned_pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          const duration = parseFloat(String(row.pouring_time_sec || 0).replace(/[^0-9.]/g, "")) || 0;
          const grade = row.grade ? String(row.grade).toUpperCase().trim() : "WCB";
          const customer = row.customer || "N/A";
          
          flatPours.push({
            date,
            heatNo,
            grade,
            customer,
            plannedWeight,
            pouredWeight,
            duration,
            sequence: idx + 1,
            deltaTemp: parseFloat(String(ext.pouring_details?.tapping_temperature || 0).replace(/[^0-9.]/g, "")) - 
                       parseFloat(String(row.pouring_temperature || ext.pouring_details?.pouring_temperatures?.[idx] || 0).replace(/[^0-9.]/g, ""))
          });
        });
      }
      // 2. queue_pages (6-page format)
      else if (ext.queue_pages && Array.isArray(ext.queue_pages)) {
        ext.queue_pages.forEach((page, idx) => {
          const prod = page.production_plan || {};
          const pour = page.pouring_details || {};
          const pouredWeight = parseFloat(String(pour.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          const plannedWeight = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          const duration = parseFloat(String(pour.pouring_sec || 0).replace(/[^0-9.]/g, "")) || 0;
          const grade = prod.grade ? String(prod.grade).toUpperCase().trim() : "WCB";
          const customer = prod.customer || "N/A";

          flatPours.push({
            date,
            heatNo,
            grade,
            customer,
            plannedWeight,
            pouredWeight,
            duration,
            sequence: idx + 1,
            deltaTemp: parseFloat(String(pour.tapping_temp || 0).replace(/[^0-9.]/g, "")) - 
                       parseFloat(String(pour.pouring_temp || 0).replace(/[^0-9.]/g, ""))
          });
        });
      }
      // 3. latest dynamic format (Moulding output structure)
      else if (ext.document_metadata || ext.pouring_details || ext.product_details) {
        const metadata = ext.document_metadata || {};
        const prod = ext.product_details || {};
        const pour = ext.pouring_details || {};
        
        const tempsStr = String(pour.pouring_temperature || "");
        const temps = tempsStr ? tempsStr.split(',').map(t => t.trim()) : [];
        
        const durationStr = String(pour.duration || "");
        const durations = durationStr ? durationStr.split(',').map(d => d.trim()) : [];
        
        const count = Math.max(temps.length, durations.length, 1);
        
        for (let i = 0; i < count; i++) {
          const pTempStr = temps[i] || "";
          const pDurStr = durations[i] || "";
          
          const pouredWeight = parseFloat(String(pour.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          const plannedWeight = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
          
          const pTemp = parseFloat(pTempStr.replace(/[^0-9.]/g, "")) || 0;
          const pDur = parseFloat(pDurStr.replace(/[^0-9.]/g, "")) || 0;
          const tappingTemp = parseFloat(String(pour.tapping_temperature || pour.tapping_temp || 0).replace(/[^0-9.]/g, "")) || 0;
          
          flatPours.push({
            date,
            heatNo,
            grade: prod.grade ? String(prod.grade).toUpperCase().trim() : "WCB",
            customer: prod.customer || "N/A",
            plannedWeight: plannedWeight / (count || 1), // divide weight if multiple pours
            pouredWeight: pouredWeight / (count || 1),
            duration: pDur,
            sequence: i + 1,
            deltaTemp: tappingTemp && pTemp ? (tappingTemp - pTemp) : 0
          });
        }
      }
    });
    return flatPours;
  }, [allDbDocuments]);

  // Clean Grade names helper
  const normalizeGrade = (gradeName) => {
    if (!gradeName) return "WCB";
    const g = String(gradeName).toUpperCase().replace(/[^A-Z0-9-]/g, "").trim();
    if (g.includes("WCB")) return "WCB";
    if (g.includes("5A") || g === "SA") return "5A";
    if (g.includes("CF8")) return "CF8";
    if (g.includes("CF3")) return "CF3";
    if (g.includes("CA6NM")) return "CA6NM";
    if (g.includes("CA15")) return "CA15";
    return g || "Others";
  };

  // KPIs will be calculated later in this file.

  // --- 6 ANALYTICS PLOTS ---

  // 1. Metal Yield Analysis Data (Liquid Weight vs. Casting Weight)
  const yieldAnalysisData = useMemo(() => {
    const data = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;
      
      const processPage = (pageData) => {
        if (!pageData) return;
        const prod = pageData.product_details || {};
        const castingWt = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const liquidWt = parseFloat(String(prod.liquid_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const grade = normalizeGrade(prod.grade);
        const description = prod.description || "Unknown Product";
        const heatNo = pageData.document_metadata?.heat_no || doc.task_id?.substring(0, 8) || "N/A";
        
        if (castingWt > 0 && liquidWt > 0) {
          const yieldPct = parseFloat(((castingWt / liquidWt) * 100).toFixed(2));
          data.push({
            heatNo,
            description,
            castingWeight: castingWt,
            liquidWeight: liquidWt,
            yield: yieldPct,
            grade
          });
        }
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });
    
    if (data.length === 0) {
      return [
        { heatNo: "B23722-01", description: "STG CASE GPD", castingWeight: 184, liquidWeight: 330, yield: 55.76, grade: "6A" },
        { heatNo: "B23722-02", description: "VALVE BODY", castingWeight: 240, liquidWeight: 420, yield: 57.14, grade: "WCB" },
        { heatNo: "B23722-03", description: "PUMP IMPELLER", castingWeight: 85, liquidWeight: 160, yield: 53.12, grade: "CF8" }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 2. Material Consumption Breakdown Data (Silica, Chromite, etc.)
  const consumableUsageData = useMemo(() => {
    const data = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const processPage = (pageData) => {
        if (!pageData) return;
        const metadata = pageData.document_metadata || {};
        const heatNo = metadata.heat_no || doc.task_id?.substring(0, 8) || "N/A";
        const sand = pageData.refractory_sleeve_and_sand_consumption || {};
        
        const top = sand.top || {};
        const bottom = sand.bottom || {};
        
        const chromite = (parseFloat(String(top.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(bottom.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0);
        const silica = (parseFloat(String(top.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                        (parseFloat(String(bottom.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0);
        const sinotherm = (parseFloat(String(top.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0) +
                           (parseFloat(String(bottom.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0);
        const activator = (parseFloat(String(top.activator || 0).replace(/[^0-9.]/g, "")) || 0) +
                           (parseFloat(String(bottom.activator || 0).replace(/[^0-9.]/g, "")) || 0);
        const sparklex = (parseFloat(String(top.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(bottom.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0);

        let sleevesCount = 0;
        if (pageData.materials_table && Array.isArray(pageData.materials_table)) {
          pageData.materials_table.forEach(m => {
            const qty = parseFloat(String(m.actual_qty || m.slv_qty || 0).replace(/[^0-9.]/g, "")) || 0;
            if (m.sle_name?.toLowerCase().includes("sleeve")) {
              sleevesCount += qty;
            }
          });
        }
        
        if (chromite > 0 || silica > 0) {
          data.push({
            heatNo,
            chromite,
            silica,
            sinotherm,
            activator,
            sparklex,
            sleeves: sleevesCount
          });
        }
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (data.length === 0) {
      return [
        { heatNo: "B23722-01", chromite: 90, silica: 2722, sinotherm: 59, activator: 12, sparklex: 9.6, sleeves: 6 },
        { heatNo: "B23722-02", chromite: 60, silica: 1815, sinotherm: 39, activator: 8, sparklex: 6.4, sleeves: 4 },
        { heatNo: "B23722-03", chromite: 120, silica: 3630, sinotherm: 78, activator: 16, sparklex: 12.8, sleeves: 8 }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 3. Quality Requirement Complexity Index Data (QA count)
  const qaComplexityData = useMemo(() => {
    const data = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const processPage = (pageData) => {
        if (!pageData) return;
        const prod = pageData.product_details || {};
        const productDesc = prod.description || "Unknown Product";
        const heatNo = pageData.document_metadata?.heat_no || doc.task_id?.substring(0, 8) || "N/A";
        const qaParams = pageData.qa_parameters || [];
        
        const testCount = qaParams.filter(p => 
          p && 
          p.trim() !== "" && 
          !p.toLowerCase().endsWith(":") && 
          !p.toLowerCase().includes("specification")
        ).length;

        data.push({
          product: `${productDesc.substring(0, 15)} (${heatNo})`,
          testsCount: testCount || qaParams.length || 0
        });
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (data.length === 0 || data.every(d => d.testsCount === 0)) {
      return [
        { product: "STG CASE GPD (B23722-01)", testsCount: 14 },
        { product: "VALVE BODY (B23722-02)", testsCount: 8 },
        { product: "PUMP IMPELLER (B23722-03)", testsCount: 5 }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 4. Customer-wise Production Complexity Data (Avg Weight vs. Avg Tests)
  const customerComplexityData = useMemo(() => {
    const customerMap = {};
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const processPage = (pageData) => {
        if (!pageData) return;
        const prod = pageData.product_details || {};
        const customer = prod.customer || "N/A";
        const castingWt = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const qty = parseFloat(String(prod.qty || 1).replace(/[^0-9.]/g, "")) || 1;
        const qaParams = pageData.qa_parameters || [];
        const testCount = qaParams.filter(p => 
          p && 
          p.trim() !== "" && 
          !p.toLowerCase().endsWith(":") && 
          !p.toLowerCase().includes("specification")
        ).length || qaParams.length || 0;

        if (!customerMap[customer]) {
          customerMap[customer] = {
            customer,
            totalCastingWeight: 0,
            totalTests: 0,
            totalQuantity: 0,
            count: 0
          };
        }
        
        customerMap[customer].totalCastingWeight += castingWt * qty;
        customerMap[customer].totalTests += testCount * qty;
        customerMap[customer].totalQuantity += qty;
        customerMap[customer].count += 1;
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    const data = Object.values(customerMap).map(c => ({
      customer: c.customer,
      avgWeight: Math.round(c.totalCastingWeight / c.totalQuantity),
      avgTests: parseFloat((c.totalTests / c.totalQuantity).toFixed(1)),
      totalQty: c.totalQuantity
    })).filter(c => c.avgWeight > 0);

    if (data.length === 0) {
      return [
        { customer: "RUHRPUMPEN INDIA", avgWeight: 184, avgTests: 14, totalQty: 10 },
        { customer: "FLOWSERVE COPL", avgWeight: 320, avgTests: 8, totalQty: 15 },
        { customer: "KBS PUMPS LTD", avgWeight: 95, avgTests: 5, totalQty: 30 }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 5. Production Risk Heatmap Data
  const riskHeatmapData = useMemo(() => {
    const data = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const processPage = (pageData) => {
        if (!pageData) return;
        const prod = pageData.product_details || {};
        const metadata = pageData.document_metadata || {};
        
        const description = prod.description || "Unknown Product";
        const heatNo = metadata.heat_no || doc.task_id?.substring(0, 8) || "N/A";
        
        const castingWt = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const liquidWt = parseFloat(String(prod.liquid_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const yieldPct = liquidWt > 0 ? (castingWt / liquidWt) * 100 : 60;
        
        const qaParams = pageData.qa_parameters || [];
        const testCount = qaParams.filter(p => 
          p && 
          p.trim() !== "" && 
          !p.toLowerCase().endsWith(":") && 
          !p.toLowerCase().includes("specification")
        ).length || qaParams.length || 0;
        
        const sand = pageData.refractory_sleeve_and_sand_consumption || {};
        const silica = (parseFloat(String(sand.top?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                       (parseFloat(String(sand.bottom?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0);
                       
        const qty = parseFloat(String(prod.qty || 1).replace(/[^0-9.]/g, "")) || 1;
        
        const yieldRisk = yieldPct < 55 ? "HIGH" : yieldPct < 60 ? "MED" : "LOW";
        const qaRisk = testCount > 10 ? "HIGH" : testCount > 5 ? "MED" : "LOW";
        const sandRisk = silica > 2000 ? "HIGH" : silica > 1000 ? "MED" : "LOW";
        const qtyRisk = qty > 10 ? "HIGH" : qty > 5 ? "MED" : "LOW";
        
        const score = (yieldRisk === "HIGH" ? 3 : yieldRisk === "MED" ? 2 : 1) +
                      (qaRisk === "HIGH" ? 3 : qaRisk === "MED" ? 2 : 1) +
                      (sandRisk === "HIGH" ? 3 : sandRisk === "MED" ? 2 : 1) +
                      (qtyRisk === "HIGH" ? 3 : qtyRisk === "MED" ? 2 : 1);
                      
        data.push({
          product: `${description.substring(0, 15)} (${heatNo})`,
          yield: yieldPct.toFixed(1) + "%",
          yieldRisk,
          qa: testCount,
          qaRisk,
          usage: silica + " kg",
          sandRisk,
          quantity: qty,
          qtyRisk,
          overallRisk: score >= 9 ? "HIGH" : score >= 6 ? "MED" : "LOW"
        });
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (data.length === 0) {
      return [
        { product: "STG CASE GPD (B23722-01)", yield: "55.8%", yieldRisk: "MED", qa: 14, qaRisk: "HIGH", usage: "2722 kg", sandRisk: "HIGH", quantity: 2, qtyRisk: "LOW", overallRisk: "MED" },
        { product: "VALVE BODY (B23722-02)", yield: "57.1%", yieldRisk: "MED", qa: 8, qaRisk: "MED", usage: "1815 kg", sandRisk: "MED", quantity: 1, qtyRisk: "LOW", overallRisk: "LOW" },
        { product: "PUMP IMPELLER (B23722-03)", yield: "53.1%", yieldRisk: "HIGH", qa: 5, qaRisk: "LOW", usage: "3630 kg", sandRisk: "HIGH", quantity: 12, qtyRisk: "HIGH", overallRisk: "HIGH" }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 6. Material Cost Contribution Pareto Data
  const costParetoData = useMemo(() => {
    const priceMap = {
      silica: 0.15,
      chromite: 0.65,
      sinotherm: 1.80,
      activator: 3.50,
      sparklex: 2.50,
      sleeves: 12.00
    };
    
    let totalSilica = 0;
    let totalChromite = 0;
    let totalSinotherm = 0;
    let totalActivator = 0;
    let totalSparklex = 0;
    let totalSleeves = 0;

    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;

      const processPage = (pageData) => {
        if (!pageData) return;
        const sand = pageData.refractory_sleeve_and_sand_consumption || {};
        
        totalSilica += (parseFloat(String(sand.top?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                       (parseFloat(String(sand.bottom?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0);
                       
        totalChromite += (parseFloat(String(sand.top?.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                         (parseFloat(String(sand.bottom?.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0);
                         
        totalSinotherm += (parseFloat(String(sand.top?.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(sand.bottom?.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0);
                          
        totalActivator += (parseFloat(String(sand.top?.activator || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(sand.bottom?.activator || 0).replace(/[^0-9.]/g, "")) || 0);
                          
        totalSparklex += (parseFloat(String(sand.top?.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0) +
                         (parseFloat(String(sand.bottom?.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0);

        if (pageData.materials_table && Array.isArray(pageData.materials_table)) {
          pageData.materials_table.forEach(m => {
            const qty = parseFloat(String(m.actual_qty || m.slv_qty || 0).replace(/[^0-9.]/g, "")) || 0;
            if (m.sle_name?.toLowerCase().includes("sleeve")) {
              totalSleeves += qty;
            }
          });
        }
      };

      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (totalSilica === 0 && totalChromite === 0) {
      totalSilica = 8167;
      totalChromite = 270;
      totalSinotherm = 176;
      totalActivator = 36;
      totalSparklex = 28.8;
      totalSleeves = 18;
    }

    const costs = [
      { name: "Silica Sand", cost: totalSilica * priceMap.silica },
      { name: "Chromite Sand", cost: totalChromite * priceMap.chromite },
      { name: "Sinotherm Binder", cost: totalSinotherm * priceMap.sinotherm },
      { name: "Activator Catalyst", cost: totalActivator * priceMap.activator },
      { name: "Sparklex Coating", cost: totalSparklex * priceMap.sparklex },
      { name: "Refractory Sleeves", cost: totalSleeves * priceMap.sleeves }
    ];

    costs.sort((a, b) => b.cost - a.cost);
    const totalCost = costs.reduce((sum, c) => sum + c.cost, 0);

    let cumSum = 0;
    const pareto = costs.map(c => {
      const pct = (c.cost / totalCost) * 100;
      cumSum += pct;
      return {
        name: c.name,
        cost: Math.round(c.cost),
        percentage: parseFloat(pct.toFixed(1)),
        cumulative: parseFloat(Math.min(100, cumSum).toFixed(1))
      };
    });

    return pareto;
  }, [allDbDocuments]);

  // 7. Yield Ranking Data
  const yieldRankingData = useMemo(() => {
    return [...yieldAnalysisData].sort((a, b) => b.yield - a.yield);
  }, [yieldAnalysisData]);

  // 8. Material Treemap Data
  const materialTreemapData = useMemo(() => {
    let totalSilica = 0;
    let totalChromite = 0;
    let totalSinotherm = 0;
    let totalActivator = 0;
    let totalSparklex = 0;
    let totalSleeves = 0;

    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;
      const processPage = (pageData) => {
        if (!pageData) return;
        const sand = pageData.refractory_sleeve_and_sand_consumption || {};
        totalSilica += (parseFloat(String(sand.top?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                       (parseFloat(String(sand.bottom?.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0);
        totalChromite += (parseFloat(String(sand.top?.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                         (parseFloat(String(sand.bottom?.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0);
        totalSinotherm += (parseFloat(String(sand.top?.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(sand.bottom?.sinotherm || 0).replace(/[^0-9.]/g, "")) || 0);
        totalActivator += (parseFloat(String(sand.top?.activator || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(sand.bottom?.activator || 0).replace(/[^0-9.]/g, "")) || 0);
        totalSparklex += (parseFloat(String(sand.top?.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0) +
                         (parseFloat(String(sand.bottom?.sparklex_100a_isomol || 0).replace(/[^0-9.]/g, "")) || 0);
        if (pageData.materials_table && Array.isArray(pageData.materials_table)) {
          pageData.materials_table.forEach(m => {
            const qty = parseFloat(String(m.actual_qty || m.slv_qty || 0).replace(/[^0-9.]/g, "")) || 0;
            if (m.sle_name?.toLowerCase().includes("sleeve")) {
              totalSleeves += qty;
            }
          });
        }
      };
      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (totalSilica === 0 && totalChromite === 0) {
      totalSilica = 8167;
      totalChromite = 270;
      totalSinotherm = 176;
      totalActivator = 36;
      totalSparklex = 28.8;
      totalSleeves = 18;
    }

    return [
      { name: "Silica Sand", size: totalSilica, fill: COLORS.orange },
      { name: "Chromite Sand", size: totalChromite, fill: COLORS.cyan },
      { name: "Sinotherm Binder", size: totalSinotherm, fill: COLORS.indigo },
      { name: "Activator Catalyst", size: totalActivator, fill: COLORS.teal },
      { name: "Sparklex Coating", size: totalSparklex, fill: COLORS.amber },
      { name: "Refractory Sleeves", size: totalSleeves, fill: COLORS.rose }
    ].filter(d => d.size > 0).sort((a, b) => b.size - a.size);
  }, [allDbDocuments]);

  // 9. Material Intensity Data
  const materialIntensityData = useMemo(() => {
    const data = [];
    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;
      const processPage = (pageData) => {
        if (!pageData) return;
        const metadata = pageData.document_metadata || {};
        const heatNo = metadata.heat_no || doc.task_id?.substring(0, 8) || "N/A";
        const prod = pageData.product_details || {};
        const castingWt = parseFloat(String(prod.casting_weight || 0).replace(/[^0-9.]/g, "")) || 0;
        const sand = pageData.refractory_sleeve_and_sand_consumption || {};
        
        const top = sand.top || {};
        const bottom = sand.bottom || {};
        const sandTotal = (parseFloat(String(top.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(bottom.silica_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(top.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0) +
                          (parseFloat(String(bottom.chromite_sand || 0).replace(/[^0-9.]/g, "")) || 0);
                          
        if (castingWt > 0 && sandTotal > 0) {
          const intensity = parseFloat((sandTotal / castingWt).toFixed(2));
          data.push({
            heatNo,
            intensity,
            sandTotal,
            castingWt
          });
        }
      };
      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (data.length === 0) {
      return [
        { heatNo: "B23722-01", intensity: 15.28, sandTotal: 2812, castingWt: 184 },
        { heatNo: "B23722-02", intensity: 7.81, sandTotal: 1875, castingWt: 240 },
        { heatNo: "B23722-03", intensity: 44.12, sandTotal: 3750, castingWt: 85 }
      ];
    }
    return data;
  }, [allDbDocuments]);

  // 10. QA Radar Data
  const qaRadarData = useMemo(() => {
    let tensile = 0;
    let impact = 0;
    let ferrite = 0;
    let igc = 0;
    let dpi = 0;
    let visual = 0;
    let totalJobs = 0;

    allDbDocuments.forEach((doc) => {
      const ext = doc.extracted_data;
      if (!ext) return;
      const processPage = (pageData) => {
        if (!pageData) return;
        const qa = pageData.qa_parameters || [];
        if (qa.length === 0) return;
        totalJobs++;
        
        qa.forEach(param => {
          const p = String(param).toUpperCase();
          if (p.includes("TENSILE")) tensile++;
          if (p.includes("IMPACT") || p.includes("CVN")) impact++;
          if (p.includes("FERRITE") || p.includes("E562")) ferrite++;
          if (p.includes("IGC") || p.includes("G48")) igc++;
          if (p.includes("DPI") || p.includes("PENETRANT")) dpi++;
          if (p.includes("VISUAL") || p.includes("MSS-SP") || p.includes("MSS SP")) visual++;
        });
      };
      if (ext.pages && Array.isArray(ext.pages)) {
        ext.pages.forEach(processPage);
      } else {
        processPage(ext);
      }
    });

    if (totalJobs === 0) {
      return [
        { subject: 'Tensile', A: 100, B: 80, fullMark: 100 },
        { subject: 'Impact', A: 67, B: 80, fullMark: 100 },
        { subject: 'Ferrite', A: 67, B: 80, fullMark: 100 },
        { subject: 'IGC', A: 67, B: 80, fullMark: 100 },
        { subject: 'DPI', A: 100, B: 80, fullMark: 100 },
        { subject: 'Visual', A: 100, B: 80, fullMark: 100 }
      ];
    }

    return [
      { subject: 'Tensile', A: Math.round((tensile / totalJobs) * 100), B: 80, fullMark: 100 },
      { subject: 'Impact', A: Math.round((impact / totalJobs) * 100), B: 80, fullMark: 100 },
      { subject: 'Ferrite', A: Math.round((ferrite / totalJobs) * 100), B: 80, fullMark: 100 },
      { subject: 'IGC', A: Math.round((igc / totalJobs) * 100), B: 80, fullMark: 100 },
      { subject: 'DPI', A: Math.round((dpi / totalJobs) * 100), B: 80, fullMark: 100 },
      { subject: 'Visual', A: Math.round((visual / totalJobs) * 100), B: 80, fullMark: 100 }
    ];
  }, [allDbDocuments]);

  // 11. QA Burden Card Stats
  const qaBurdenStats = useMemo(() => {
    const counts = qaComplexityData.map(d => d.testsCount);
    const maxTests = counts.length > 0 ? Math.max(...counts) : 14;
    const avgTests = counts.length > 0 ? parseFloat((counts.reduce((sum, c) => sum + c, 0) / counts.length).toFixed(1)) : 9.0;
    const complexity = avgTests > 10 ? "HIGH" : avgTests > 5 ? "MED" : "LOW";
    return {
      maxTests,
      avgTests,
      complexity
    };
  }, [qaComplexityData]);

  // 12. Risk Matrix Dataset
  const riskMatrixData = useMemo(() => {
    return riskHeatmapData.map(row => {
      const yieldVal = parseFloat(row.yield.replace(/[^0-9.]/g, "")) || 50;
      const qaVal = parseInt(row.qa) || 0;
      const materialVal = parseFloat(row.usage.replace(/[^0-9.]/g, "")) || 0;
      return {
        ...row,
        x: yieldVal,
        y: qaVal,
        z: materialVal
      };
    });
  }, [riskHeatmapData]);

  // 13. Revised KPIs
  const kpiStats = useMemo(() => {
    const heats = new Set(allDbDocuments.map(d => d.extracted_data?.document_info?.heat_no || d.extracted_data?.document_metadata?.heat_no || d.task_id));
    const totalTonnage = allHistoricalPours.reduce((sum, p) => sum + p.pouredWeight, 0) / 1000.0;
    
    const yieldsList = yieldAnalysisData.map(d => d.yield);
    const avgYield = yieldsList.length > 0 ? parseFloat((yieldsList.reduce((sum, y) => sum + y, 0) / yieldsList.length).toFixed(1)) : 56.2;

    const qaCounts = qaComplexityData.map(d => d.testsCount);
    const avgQaScore = qaCounts.length > 0 ? parseFloat((qaCounts.reduce((sum, q) => sum + q, 0) / qaCounts.length).toFixed(1)) : 8.5;

    const activeCustomers = new Set(allHistoricalPours.map(p => p.customer).filter(c => c && c !== "N/A"));
    const highRiskJobs = riskHeatmapData.filter(r => r.overallRisk === "HIGH").length;

    return {
      totalHeats: heats.size,
      totalTonnage: parseFloat(totalTonnage.toFixed(2)),
      avgYield,
      avgQaScore,
      activeCustomers: activeCustomers.size || 3,
      highRiskJobs
    };
  }, [allDbDocuments, allHistoricalPours, yieldAnalysisData, qaComplexityData, riskHeatmapData]);


  // -------------------------------------------------------------
  // HISTORICAL RECORDS SEARCH & PAGINATION
  // -------------------------------------------------------------
  const filteredHistoryRows = useMemo(() => {
    return allDbDocuments.filter(doc => {
      const ext = doc.extracted_data;
      if (!ext) return false;
      const searchLower = historySearchQuery.toLowerCase();
      
      const heat = String(ext.document_info?.heat_no || ext.document_metadata?.heat_no || doc.task_id || "").toLowerCase();
      const date = String(ext.document_info?.date || ext.document_metadata?.date || "").toLowerCase();
      const capacity = String(ext.document_info?.ladle_capacity || ext.pouring_details?.laddle_temp || "").toLowerCase();
      
      return heat.includes(searchLower) || date.includes(searchLower) || capacity.includes(searchLower);
    });
  }, [allDbDocuments, historySearchQuery]);

  const paginatedHistoryRows = useMemo(() => {
    const firstIdx = (historyPage - 1) * historyRowsPerPage;
    const lastIdx = firstIdx + historyRowsPerPage;
    return filteredHistoryRows.slice(firstIdx, lastIdx);
  }, [filteredHistoryRows, historyPage, historyRowsPerPage]);

  const totalHistoryPages = Math.ceil(filteredHistoryRows.length / historyRowsPerPage);


  // -------------------------------------------------------------
  // RENDERING COMPONENT
  // -------------------------------------------------------------
  return (
    <div className="p-8 max-w-[1600px] mx-auto z-10 relative">
      
      {/* 1. TAB: Ingest & Upload */}
      {activeTab === 'ingest' && (
        <div className="space-y-8 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            
            {/* Uploader Card */}
            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[500px]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <UploadCloud className="text-[#f97316]" size={24} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stage a Moulding Production Plan</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 leading-relaxed">
                  Drop a scanned PDF or photograph of the Production Plan. The parsing engine extracts metadata, product specifications, sand & consumable quantities, and quality check statuses.
                </p>
                
                {/* Drag Drop Area */}
                <div
                  onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-150 h-64 ${
                    dragActive 
                      ? 'border-[#f97316] bg-orange-50/10 scale-[0.99]' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-100/10'
                  }`}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    onChange={handleFileChange} 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-slate-400 mb-4 border border-slate-250/20 dark:border-slate-800 shadow-sm">
                    <UploadCloud size={28} className="text-[#f97316]" />
                  </div>
                  <p className="text-slate-750 dark:text-slate-200 text-sm font-bold mb-1">
                    {file ? file.name : "Drag & drop Production Plan"}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    PDF - TIFF - JPG up to 40 MB
                  </p>
                </div>
              </div>
              
              {/* Uploader Controls */}
              <div className="mt-6 flex items-center justify-end">
                <button
                  onClick={handleUpload} 
                  disabled={loading || !file}
                  className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 ${
                    loading || !file 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed border border-transparent' 
                      : 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:scale-[1.02] shadow-orange-500/10'
                  }`}
                >
                  {loading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Extracting Data...</span></>
                  ) : (
                    <><ArrowRight size={14} /><span>Upload & Process</span></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-8 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-[#f97316] animate-spin" />
              </div>
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider">Neural Engine Processing</h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-550 mt-1 max-w-[280px]">Running Optical Character Recognition, layout parsing and aligning structural fields...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex gap-3 text-xs">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <div><strong className="font-bold uppercase block mb-0.5">Extraction Failed</strong>{error}</div>
            </div>
          )}

        </div>
      )}

      {/* 2. TAB: Digitized Viewer */}
      {activeTab === 'viewer' && (
        <div className="space-y-8 animate-fade-in">
          
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex gap-3 text-xs">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <div><strong className="font-bold uppercase block mb-0.5">Extraction Failed</strong>{error}</div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {result?.document_metadata?.heat_no || result?.document_info?.heat_no ? `Cycle Report: ${result?.document_metadata?.heat_no || result?.document_info?.heat_no}` : "Heat Treatment Cycle Report"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Structured extraction of the cycle report, aligned to backend schema blocks A through E.
              </p>
            </div>
            
            {result ? (
              <div className="flex items-center gap-3">
                {hasNextPage && (
                  <button
                    onClick={handleProcessNextPage}
                    disabled={nextPageLoading}
                    className="px-4 py-1.5 bg-[#f97316] text-white hover:bg-[#ea580c] disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02] shadow-orange-500/10 animate-pulse"
                  >
                    {nextPageLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} fill="currentColor" />
                        <span>Process Page {currentPage + 2} of {totalPages}</span>
                      </>
                    )}
                  </button>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 border border-orange-200 text-[#f97316] dark:bg-orange-500/10 dark:border-orange-500/20 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" /> Parsed
                </span>
                <button
                  onClick={handleCloseRecord}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/30 text-slate-500 dark:text-slate-400 hover:text-slate-700 text-xs font-bold uppercase transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 uppercase tracking-wide">
                No active document
              </span>
            )}
          </div>

          {!result ? (
            <div className="py-24 text-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8">
              <FileText size={48} className="text-slate-350 dark:text-slate-700 mb-4" />
              <h3 className="text-slate-800 dark:text-slate-200 text-sm font-bold uppercase tracking-wider">No Cycle Log Selected</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-[280px] leading-relaxed">
                Please upload a document in the Ingest tab or click any record in the Historical Logs tab to review its digitized schema blocks here.
              </p>
              <button
                onClick={() => setActiveTab('ingest')}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shadow-orange-500/10"
              >
                Go to Ingest
              </button>
            </div>
          ) : (() => {
            const pagesList = result.pages || [result];
            const pageData = pagesList[activeViewerPage] || pagesList[0] || {};
            
            return (
              <div className="space-y-6">
                
                {/* Pages Navigation Bar */}
                {(pagesList.length > 1 || totalPages > 1) && (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-3 rounded-2xl mb-6 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#f97316]" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Document Pages: <strong className="text-[#f97316] font-mono">{pagesList.length} parsed {totalPages > pagesList.length ? `(out of ${totalPages})` : ''}</strong>
                      </span>
                    </div>
                    {pagesList.length > 1 && (
                      <div className="flex items-center gap-3">
                        <button
                          disabled={activeViewerPage === 0}
                          onClick={() => setActiveViewerPage(prev => prev - 1)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-650 dark:text-slate-400"
                        >
                          Previous Page
                        </button>
                        <span className="text-xs font-mono font-bold text-[#f97316]">
                          Viewing Page {activeViewerPage + 1} of {pagesList.length}
                        </span>
                        <button
                          disabled={activeViewerPage === pagesList.length - 1}
                          onClick={() => setActiveViewerPage(prev => prev + 1)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-650 dark:text-slate-400"
                        >
                          Next Page
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* BLOCK A: Metadata */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block A · Metadata</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Document Title</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.document_metadata?.form_id || "Production Plan"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Heat No</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold text-[#f97316]">{pageData.document_metadata?.heat_no || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Planning Date</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.document_metadata?.planning_date || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pouring Date</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                        {pageData.document_metadata?.pouring_date || "N/A"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* BLOCK B: Product Details */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block B · Product Details</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Description</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.description || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Customer</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.customer || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Grade</span>
                      <strong className="text-[#f97316] font-bold">{pageData.product_details?.grade || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Casting Weight (kg)</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.casting_weight || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Liquid Weight (kg)</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.liquid_weight || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Qty</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.qty || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Sample / Bulk</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.sample_bulk || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Finish Type</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.finish_type || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pattern Code</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.pattern_code || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pattern Serial No</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.pattern_serial_no || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pattern Type</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.pattern_type || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Drawing Number</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.drawing_number || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Part No</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.part_no || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pcs In Box</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.pcs_in_box || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">No of Core Boxes</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.no_of_core_boxes || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">No of Cores</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.no_of_cores || "N/A"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Method Remarks</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.product_details?.method_remarks || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* BLOCK C: QA Parameters Checklist */}
                {pageData.qa_parameters && pageData.qa_parameters.length > 0 && (
                  <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block C · QA Parameters Checklist</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pageData.qa_parameters.map((param, i) => (
                        <span key={i} className="inline-block px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* BLOCK D: Moulding & Coating Details */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block D · Moulding & Coating Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                      <h4 className="text-xs font-bold text-[#f97316] uppercase tracking-wider mb-3">Top Moulding</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Contractor</span><strong>{pageData.moulding_details?.top?.contractor || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Moulder</span><strong>{pageData.moulding_details?.top?.moulder || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Moulding Time</span><strong>{pageData.moulding_details?.top?.moulding_date || ""} {pageData.moulding_details?.top?.moulding_time || ""}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Coating Details</span><strong>{pageData.moulding_details?.top?.coating_details || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Coating Time</span><strong>{pageData.moulding_details?.top?.coating_date || ""} {pageData.moulding_details?.top?.coating_time || ""}</strong></div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                      <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-3">Bottom Moulding</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Contractor</span><strong>{pageData.moulding_details?.bottom?.contractor || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Moulder</span><strong>{pageData.moulding_details?.bottom?.moulder || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Moulding Time</span><strong>{pageData.moulding_details?.bottom?.moulding_date || ""} {pageData.moulding_details?.bottom?.moulding_time || ""}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Coating Details</span><strong>{pageData.moulding_details?.bottom?.coating_details || "N/A"}</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Coating Time</span><strong>{pageData.moulding_details?.bottom?.coating_date || ""} {pageData.moulding_details?.bottom?.coating_time || ""}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCK E: Inspection Parameters */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block E · Quality & Mould Inspection Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Pattern Finishing</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.pattern_finishing || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Process Type</span>
                      <strong className="text-[#f97316] font-bold">{pageData.inspection_parameters?.process || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Chill Size & Thickness</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.chill_size_thickness || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Chill Slot Blasted</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.chill_slot_blasted || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Chill Finishing</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.chill_finishing || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Sleeve Size & Oven Temp</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.sleeve_size_oven || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Refractory Sleeve</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.refactory_sleeve || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Lettering Checking</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.lettering_checking || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Mould Checking</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.inspection_parameters?.mould_checking || "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* BLOCK F: Sand Consumption & Notes */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block F · Sand Consumption Details</span>
                    {pageData.refractory_sleeve_and_sand_consumption?.notes && (
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-950/20 text-[#f97316] font-bold px-2 py-0.5 rounded">
                        {pageData.refractory_sleeve_and_sand_consumption.notes}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                      <h4 className="text-xs font-bold text-[#f97316] uppercase tracking-wider mb-3">Top Consumption</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Chromite Sand</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.top?.chromite_sand || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Silica Sand</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.top?.silica_sand || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Sinotherm</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.top?.sinotherm || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Activator</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.top?.activator || "0"} L</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Sparklex 100A Isomol</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.top?.sparklex_100a_isomol || "0"} L</strong></div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                      <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-3">Bottom Consumption</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Chromite Sand</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.bottom?.chromite_sand || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Silica Sand</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.bottom?.silica_sand || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Sinotherm</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.bottom?.sinotherm || "0"} kg</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Activator</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.bottom?.activator || "0"} L</strong></div>
                        <div><span className="text-slate-400 block font-semibold text-[9px] uppercase">Sparklex 100A Isomol</span><strong>{pageData.refractory_sleeve_and_sand_consumption?.bottom?.sparklex_100a_isomol || "0"} L</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCK G: Materials & Sleeve Consumption Details */}
                {pageData.materials_table && pageData.materials_table.length > 0 && (
                  <FioriSectionTable 
                    title="Block G · Materials & Sleeve Consumption Details" 
                    data={pageData.materials_table} 
                    icon={Scale} 
                  />
                )}

                {/* BLOCK H: Verification Signatures */}
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block H · Verification Signatures</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Planned By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.planned_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.planned_by?.toLowerCase().includes("signed") && !pageData.signatures?.planned_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>
                    
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Pattern Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.pattern_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.pattern_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.pattern_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">QA Checked By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.qa_checked_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.qa_checked_by?.toLowerCase().includes("signed") && !pageData.signatures?.qa_checked_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Core Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.core_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.core_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.core_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Mould Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.mould_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.mould_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.mould_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Closing Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.closing_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.closing_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.closing_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Pouring Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.pouring_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.pouring_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.pouring_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Pre Production Inspected By</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-semibold">{pageData.signatures?.pre_production_inspected_by || "Unsigned"}</strong>
                      </div>
                      {pageData.signatures?.pre_production_inspected_by?.toLowerCase().includes("signed") && !pageData.signatures?.pre_production_inspected_by?.toLowerCase().includes("unsigned") ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <AlertCircle className="text-slate-350" size={16} />
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      )}

      {/* 3. TAB: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Operational Analytics</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Foundry-specific key performance indicators, material yields, quality checklists, and production risks.
              </p>
            </div>
            
            <button
              onClick={fetchDbDocuments}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-355 rounded-xl text-xs font-bold flex items-center gap-1.5 uppercase transition-all shadow-sm"
              title="Reload database metrics"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Row 1 — Executive KPIs (6 columns) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            
            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><Database size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">Total Heats</span>
              <strong className="text-slate-900 dark:text-white text-2xl font-mono tracking-tight font-extrabold">{kpiStats.totalHeats}</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><Scale size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">Total Tonnage</span>
              <strong className="text-[#f97316] text-2xl font-mono tracking-tight font-extrabold">{kpiStats.totalTonnage} t</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><TrendingUp size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">Avg Yield %</span>
              <strong className="text-slate-900 dark:text-white text-2xl font-mono tracking-tight font-extrabold">{kpiStats.avgYield}%</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><ShieldCheck size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">Avg QA Score</span>
              <strong className="text-[#f97316] text-2xl font-mono tracking-tight font-extrabold">{kpiStats.avgQaScore} tests</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><Layers size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">Active Customers</span>
              <strong className="text-slate-900 dark:text-white text-2xl font-mono tracking-tight font-extrabold">{kpiStats.activeCustomers}</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-3 bottom-3 text-slate-100 dark:text-slate-800/10 font-extrabold select-none"><AlertCircle size={32} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-bold tracking-wider block mb-1">High Risk Jobs</span>
              <strong className="text-rose-500 text-2xl font-mono tracking-tight font-extrabold">{kpiStats.highRiskJobs}</strong>
            </div>

          </div>

          {/* Row 2 — Production Efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Yield circular progress Gauge */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Yield Efficiency</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall vs. Target</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-6">
                  {/* SVG Gauge */}
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Foreground indicator */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-[#f97316]"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * kpiStats.avgYield) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-mono font-extrabold text-slate-850 dark:text-white">{kpiStats.avgYield}%</span>
                      <span className="text-[9px] text-slate-455 dark:text-slate-550 uppercase tracking-wider font-bold">Process Avg</span>
                    </div>
                  </div>

                  {/* Yield statistics */}
                  <div className="space-y-4 text-xs font-semibold text-slate-655 dark:text-slate-350">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/40 dark:border-slate-800/40 w-56">
                      <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wide block mb-1">Target Yield</span>
                      <strong className="text-slate-800 dark:text-white font-mono text-base">70.0%</strong>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/40 dark:border-slate-800/40 w-56">
                      <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wide block mb-1">Target Gap</span>
                      <strong className={`font-mono text-base ${kpiStats.avgYield >= 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(kpiStats.avgYield - 70.0).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Yield Ranking horizontal bar chart */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Yield Ranking</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Yield % by individual Heat</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={yieldRankingData} margin={{ top: 10, right: 10, bottom: 10, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-850" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <YAxis dataKey="heatNo" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={75} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="yield" name="Yield %" fill={COLORS.orange} radius={[0, 4, 4, 0]} barSize={16}>
                        {yieldRankingData.map((entry, idx) => {
                          const c = entry.yield < 55 ? COLORS.rose : entry.yield < 60 ? COLORS.amber : COLORS.teal;
                          return <Cell key={idx} fill={c} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* Row 3 — Material Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Treemap instead of stacked bars */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Consumable Dominance</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Material weight proportion</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={materialTreemapData}
                      dataKey="size"
                      stroke="#fff"
                      content={<TreemapNode />}
                    />
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Material Intensity comparison */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Material Intensity</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Consumable sand (kg) / Casting (kg)</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={materialIntensityData} margin={{ top: 15, right: 10, bottom: 15, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-850" />
                      <XAxis dataKey="heatNo" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="intensity" name="Intensity Ratio" fill={COLORS.teal} radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* Row 4 — QA Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Radar Chart */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">QA Requirement Distribution</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Test Specification Presence %</span>
                </div>
                <div className="h-[280px] w-full mt-4 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={qaRadarData}>
                      <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 8 }} />
                      <Radar name="Presence %" dataKey="A" stroke={COLORS.indigo} fill={COLORS.indigo} fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* QA Burden Score Card */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">QA Burden Index</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Quality complexity tiering</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-6">
                  {/* Gauge indicator */}
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-[#6366f1]"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * qaBurdenStats.avgTests * 5) / 100} // mapping to 20 max tests
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-mono font-extrabold text-slate-855 dark:text-white">{qaBurdenStats.avgTests}</span>
                      <span className="text-[9px] text-slate-455 dark:text-slate-555 uppercase tracking-wider font-bold">Avg Tests</span>
                    </div>
                  </div>

                  {/* KPI indicators */}
                  <div className="space-y-3 font-semibold text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center justify-between w-56 p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                      <span>Critical Tests Peak:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{qaBurdenStats.maxTests}</span>
                    </div>
                    <div className="flex items-center justify-between w-56 p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                      <span>Average Tests Count:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{qaBurdenStats.avgTests}</span>
                    </div>
                    <div className="flex items-center justify-between w-56 p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 rounded-xl">
                      <span>Complexity Rating:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        qaBurdenStats.complexity === "HIGH" 
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {qaBurdenStats.complexity}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Row 5 — Risk Intelligence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Risk Status Table */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Operational Risk status</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Yield, QA & Materials status indicator</span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-xs font-semibold text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-450 uppercase text-[9px] tracking-wider sticky top-0 border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-2.5">Heat Job</th>
                        <th className="px-4 py-2.5 text-center">Yield</th>
                        <th className="px-4 py-2.5 text-center">QA</th>
                        <th className="px-4 py-2.5 text-center">Material</th>
                        <th className="px-4 py-2.5 text-center">Overall Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                      {riskHeatmapData.map((row, idx) => {
                        const getDot = (risk) => {
                          if (risk === "HIGH") return <span className="w-3 h-3 rounded-full bg-rose-500 inline-block border-2 border-white dark:border-slate-900 shadow shadow-rose-500/40" title="High Risk" />;
                          if (risk === "MED") return <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border-2 border-white dark:border-slate-900 shadow shadow-amber-500/40" title="Medium Risk" />;
                          return <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border-2 border-white dark:border-slate-900 shadow shadow-emerald-500/40" title="Low Risk" />;
                        };
                        return (
                          <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-mono font-bold">{row.product.split(' ').pop().replace(/[()]/g, "")}</td>
                            <td className="px-4 py-3 text-center">{getDot(row.yieldRisk)}</td>
                            <td className="px-4 py-3 text-center">{getDot(row.qaRisk)}</td>
                            <td className="px-4 py-3 text-center">{getDot(row.sandRisk)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                                row.overallRisk === "HIGH" 
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                                  : row.overallRisk === "MED"
                                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              }`}>
                                {row.overallRisk}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Production Risk Matrix Scatter Bubble Chart */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Production Risk Matrix</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Bubble: Consumables, X: Yield %, Y: QA Specs</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 15, bottom: 15, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis type="number" dataKey="x" name="Yield" unit="%" stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[40, 80]} label={{ value: 'Low Yield ➔ High Yield', position: 'insideBottom', offset: -10, style: { fontSize: 8, fill: '#64748b', fontWeight: 'bold' } }} />
                      <YAxis type="number" dataKey="y" name="QA Tests" stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 20]} label={{ value: 'QA Complexity (tests)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 8, fill: '#64748b', fontWeight: 'bold' } }} />
                      <ZAxis type="number" dataKey="z" range={[60, 450]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const p = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-0.5">
                              <p className="font-bold text-slate-850 dark:text-slate-200">{p.product}</p>
                              <p className="text-slate-500 font-mono">Yield: {p.x}%</p>
                              <p className="text-slate-500 font-mono">QA Tests: {p.y}</p>
                              <p className="text-slate-500 font-mono">Consumables: {p.usage}</p>
                              <p className="text-orange-500 font-bold font-mono">Risk Level: {p.overallRisk}</p>
                            </div>
                          );
                        }
                        return null;
                      }} />
                      <Scatter name="Risk Matrix" data={riskMatrixData}>
                        {riskMatrixData.map((entry, idx) => {
                          const fill = entry.overallRisk === "HIGH" ? COLORS.rose : entry.overallRisk === "MED" ? COLORS.amber : COLORS.teal;
                          return <Cell key={idx} fill={fill} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>

          {/* Row 6 — Foundry Process Flow */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Foundry Process Flow</h3>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Lifecycle parameters per fabrication stage</span>
            </div>

            {/* Stepper Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-850 pb-6">
              {PROCESS_FLOW_STEPS.map((step, idx) => {
                const isActive = activeFlowStep === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFlowStep(idx)}
                    className={`flex-1 min-w-[120px] p-3.5 rounded-xl border text-left transition-all relative ${
                      isActive 
                        ? 'border-[#f97316] bg-orange-500/10 text-slate-900 dark:text-white shadow shadow-orange-500/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/25 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive ? 'bg-[#f97316] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-650'
                      }`}>
                        {idx + 1}
                      </span>
                      <strong className="text-xs uppercase tracking-wide truncate">{step.stage}</strong>
                    </div>
                    {isActive && (
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#f97316] rotate-45 hidden lg:block" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Step Detail Panel */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-900/60 rounded-2xl animate-fade-in flex flex-col md:flex-row gap-6 justify-between">
              <div className="space-y-4 max-w-2xl text-xs">
                <div>
                  <h4 className="text-[#f97316] uppercase font-bold text-[10px] tracking-wide mb-1">Current Stage Details</h4>
                  <strong className="text-slate-800 dark:text-white text-base">{PROCESS_FLOW_STEPS[activeFlowStep].stage}</strong>
                  <p className="text-slate-555 dark:text-slate-400 mt-1 leading-relaxed">{PROCESS_FLOW_STEPS[activeFlowStep].description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block mb-1">Materials Input</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{PROCESS_FLOW_STEPS[activeFlowStep].materials}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[9px] block mb-1">Estimated Stage Cost</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold">{PROCESS_FLOW_STEPS[activeFlowStep].costEstimate}</p>
                  </div>
                </div>
              </div>

              <div className="md:w-64 flex flex-col justify-center items-start border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[9px] block mb-2">Stage Risk Factor</span>
                <span className={`inline-block px-3 py-1.5 rounded-xl font-bold tracking-wide uppercase text-[10px] ${
                  PROCESS_FLOW_STEPS[activeFlowStep].risk.startsWith("HIGH") 
                    ? "bg-rose-500/20 border border-rose-500/35 text-rose-600 dark:text-rose-455" 
                    : PROCESS_FLOW_STEPS[activeFlowStep].risk.startsWith("MED")
                      ? "bg-amber-500/20 border border-amber-500/35 text-amber-600 dark:text-amber-455"
                      : "bg-emerald-500/20 border border-emerald-500/35 text-emerald-600 dark:text-emerald-455"
                }`}>
                  {PROCESS_FLOW_STEPS[activeFlowStep].risk.split(' ')[0]}
                </span>
                <p className="text-slate-455 dark:text-slate-500 mt-2 text-[10px] leading-relaxed">
                  {PROCESS_FLOW_STEPS[activeFlowStep].risk}
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. TAB: Historical Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Historical Cycle Archive</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Master log of every saved cycle record. Export the full database set as a multi-sheet Excel file.
              </p>
            </div>
            
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 shadow-orange-500/10"
            >
              {exporting ? (
                <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Exporting...</span></>
              ) : (
                <><Download size={14} /><span>Export to Excel</span></>
              )}
            </button>
          </div>

          {/* Historical Logs List Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Toolbar search */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#f97316]" />
                <span className="text-xs font-bold text-slate-855 dark:text-slate-200 uppercase tracking-wider">Saved Cycles database</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 px-2 py-0.5 rounded-full font-mono font-bold">
                  {filteredHistoryRows.length} matches
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search heat numbers, dates..."
                  value={historySearchQuery}
                  onChange={(e) => { setHistorySearchQuery(e.target.value); setHistoryPage(1); }}
                  className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs px-3.5 py-2 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#f97316] w-full font-semibold transition-all"
                />
                <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                <thead className="bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-550 uppercase font-bold text-[9px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left">Cycle ID</th>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Capacity / Furnace</th>
                    <th className="px-6 py-4 text-left">Grade</th>
                    <th className="px-6 py-4 text-left">Heats / Castings</th>
                    <th className="px-6 py-4 text-left">Tonnage (T)</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40 text-slate-700 dark:text-slate-350">
                  {loadingDb ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        <span className="w-5 h-5 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin inline-block mr-2" />
                        Loading cycle records from Atlas cluster...
                      </td>
                    </tr>
                  ) : paginatedHistoryRows.length > 0 ? (
                    paginatedHistoryRows.map((doc, idx) => {
                      const ext = doc.extracted_data || {};
                      
                      const date = ext.document_info?.date || ext.document_metadata?.date || "N/A";
                      const heatNo = ext.document_info?.heat_no || ext.document_metadata?.heat_no || "N/A";
                      const furnace = ext.document_info?.ladle_capacity || "1 Ton";
                      
                      let grade = "WCB";
                      let count = 0;
                      let tonnage = 0;
                      
                      if (ext.table_data) {
                        count = ext.table_data.length;
                        grade = ext.table_data[0]?.grade || "WCB";
                        tonnage = ext.table_data.reduce((sum, r) => sum + (parseFloat(String(r.actual_liquid_poured_kg || 0).replace(/[^0-9.]/g, "")) || 0), 0) / 1000.0;
                      } else if (ext.queue_pages) {
                        count = ext.queue_pages.length;
                        grade = ext.queue_pages[0]?.production_plan?.grade || "WCB";
                        tonnage = ext.queue_pages.reduce((sum, p) => sum + (parseFloat(String(p.pouring_details?.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0), 0) / 1000.0;
                      } else if (ext.product_details) {
                        count = 1;
                        grade = ext.product_details.grade || "WCB";
                        tonnage = (parseFloat(String(ext.pouring_details?.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0) / 1000.0;
                      }

                      return (
                        <tr 
                          key={doc.task_id || idx} 
                          onClick={() => {
                            setActiveDocument(doc);
                            setActiveTab('viewer');
                          }}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-900/20 transition-all cursor-pointer animate-fade-in"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-[#f97316]">{heatNo}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{date}</td>
                          <td className="px-6 py-4">{furnace}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold font-mono text-[10px] border border-slate-200/50 dark:border-transparent">
                              {normalizeGrade(grade)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">{count} pours</td>
                          <td className="px-6 py-4 font-mono font-semibold">{tonnage.toFixed(2)} t</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-450 uppercase tracking-wide border border-emerald-100 dark:border-emerald-900/20">
                              Verified
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setActiveDocument(doc);
                                setActiveTab('viewer');
                              }}
                              className="px-3.5 py-1.5 rounded-lg border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-semibold">
                        No records match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalHistoryPages > 1 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#0b0f19]/35 flex items-center justify-between text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span>Show</span>
                  <select
                    value={historyRowsPerPage}
                    onChange={(e) => { setHistoryRowsPerPage(Number(e.target.value)); setHistoryPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#f97316] font-bold"
                  >
                    {[5, 10, 20, 50].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                    disabled={historyPage === 1}
                    className={`px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${
                      historyPage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Prev
                  </button>
                  <span className="font-mono text-slate-500 dark:text-slate-400 lowercase font-medium">
                    page {historyPage} of {totalHistoryPages}
                  </span>
                  <button
                    onClick={() => setHistoryPage(prev => Math.min(totalHistoryPages, prev + 1))}
                    disabled={historyPage === totalHistoryPages}
                    className={`px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350 transition-colors ${
                      historyPage === totalHistoryPages ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
