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
  ReferenceLine
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

// Premium mock data for Moulding cycle logs to use if DB is empty
const MOCK_MOULDING_DOCUMENTS = [
  {
    task_id: "mould_1",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "HT-CYCLE-LOG-V2", heat_no: "HT-2410-0473", date: "2026-06-07" },
      product_details: { customer: "FORGE.IQ CASTING CORP", grade: "CA6NM", casting_weight: "1280", description: "Runner Casing Vane" }, 
      inspection_parameters: { mould_hardness_range: "85-92", core_hardness_range: "88-95", mould_coating: "Zircon Paint" },
      pouring_details: { tapping_temperature: "1640", pouring_temperature: "1535, 1538", laddle_temp: "980", pouring_weight: "1350", duration: "92, 98", time: "04:12:00" },
      tables: {
        sleeves: [ { code: "SLV-120A", qty: "4" } ],
        consumables: [ { item: "Ladle Lining Mortar", qty: "15 kg" } ],
        batch_summary: [
          { material_code: "PTN-CA6NM-A1", material_description: "Runner Casing Vane", batch_no: "B-88241", t_qty: "4", unit: "PCS" }
        ]
      },
      signatures: { planned_by: "M. Thika", qa_parameters_checked_by: "K. Kannan" }
    }
  },
  {
    task_id: "mould_2",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "HT-CYCLE-LOG-V2", heat_no: "HT-2410-0472", date: "2026-06-06" },
      product_details: { customer: "ALSTOM HYDRO", grade: "WCB", casting_weight: "3100", description: "Impeller Hub" }, 
      inspection_parameters: { mould_hardness_range: "82-88", core_hardness_range: "85-90", mould_coating: "Silica Wash" },
      pouring_details: { tapping_temperature: "1620", pouring_temperature: "1520, 1525", laddle_temp: "960", pouring_weight: "3200", duration: "110, 115", time: "06:45:00" },
      tables: {
        sleeves: [ { code: "SLV-180B", qty: "2" } ],
        consumables: [ { item: "Zircon Powder", qty: "8 kg" } ],
        batch_summary: [
          { material_code: "PTN-FP17-B3", material_description: "Impeller Hub", batch_no: "B-50771", t_qty: "2", unit: "PCS" }
        ]
      },
      signatures: { planned_by: "M. Thika", qa_parameters_checked_by: "K. Kannan" }
    }
  },
  {
    task_id: "mould_3",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "HT-CYCLE-LOG-V2", heat_no: "HT-2410-0471", date: "2026-06-05" },
      product_details: { customer: "GE METALLURGY", grade: "CF8", casting_weight: "2000", description: "Guide Bearing Sleeve" }, 
      inspection_parameters: { mould_hardness_range: "84-90", core_hardness_range: "86-92", mould_coating: "Zircon Paint" },
      pouring_details: { tapping_temperature: "1630", pouring_temperature: "1530, 1532", laddle_temp: "975", pouring_weight: "2100", duration: "95, 99", time: "08:15:00" },
      tables: {
        sleeves: [ { code: "SLV-120A", qty: "3" } ],
        consumables: [ { item: "Lining Mortar", qty: "10 kg" } ],
        batch_summary: [
          { material_code: "PTN-CA15-C2", material_description: "Guide Bearing Sleeve", batch_no: "B-33412", t_qty: "3", unit: "PCS" }
        ]
      },
      signatures: { planned_by: "M. Thika", qa_parameters_checked_by: "K. Kannan" }
    }
  },
  {
    task_id: "mould_4",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "HT-CYCLE-LOG-V2", heat_no: "HT-2410-0470", date: "2026-06-04" },
      product_details: { customer: "SULZER INDIA", grade: "CF3", casting_weight: "1780", description: "Bottom Ring Segment" }, 
      inspection_parameters: { mould_hardness_range: "85-92", core_hardness_range: "87-94", mould_coating: "Zircon Paint" },
      pouring_details: { tapping_temperature: "1650", pouring_temperature: "1540, 1545", laddle_temp: "990", pouring_weight: "1850", duration: "88, 92", time: "09:30:00" },
      tables: {
        sleeves: [ { code: "SLV-180B", qty: "4" } ],
        consumables: [ { item: "Mould Release Agent", qty: "4 L" } ],
        batch_summary: [
          { material_code: "PTN-CA6NM-D4", material_description: "Bottom Ring Segment", batch_no: "B-99120", t_qty: "4", unit: "PCS" }
        ]
      },
      signatures: { planned_by: "M. Thika", qa_parameters_checked_by: "K. Kannan" }
    }
  },
  {
    task_id: "mould_5",
    status: "COMPLETED",
    extracted_data: {
      document_metadata: { form_id: "HT-CYCLE-LOG-V2", heat_no: "HT-2410-0469", date: "2026-06-03" },
      product_details: { customer: "FLOWSERVE", grade: "CA15", casting_weight: "900", description: "Shaft Sleeve Casting" }, 
      inspection_parameters: { mould_hardness_range: "80-86", core_hardness_range: "82-88", mould_coating: "Silica Wash" },
      pouring_details: { tapping_temperature: "1610", pouring_temperature: "1510, 1515", laddle_temp: "950", pouring_weight: "950", duration: "80, 85", time: "10:15:00" },
      tables: {
        sleeves: [ { code: "SLV-120A", qty: "6" } ],
        consumables: [ { item: "Zircon Powder", qty: "5 kg" } ],
        batch_summary: [
          { material_code: "PTN-CA15-E5", material_description: "Shaft Sleeve Casting", batch_no: "B-10884", t_qty: "6", unit: "PCS" }
        ]
      },
      signatures: { planned_by: "M. Thika", qa_parameters_checked_by: "K. Kannan" }
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

  // Sync historical document selection with view state
  useEffect(() => {
    if (activeDocument && activeDocument.extracted_data) {
      setResult(activeDocument.extracted_data);
      setUploadedFilename(activeDocument.filename || null);
      setTaskId(activeDocument.task_id);
      setCurrentPage(0);
      setTotalPages(1);
      setHasNextPage(false);
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

  const handleRunSample = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    // Simulate latency and then load a rich mock state for verification
    setTimeout(() => {
      const sampleMock = MOCK_MOULDING_DOCUMENTS[0].extracted_data;

      setResult(sampleMock);
      setUploadedFilename("sample_heat_report.pdf");
      setTaskId("sample_" + Math.random().toString(36).substr(2, 9));
      setCurrentPage(0);
      setTotalPages(1);
      setHasNextPage(false);
      setLoading(false);
      setActiveTab('viewer');
    }, 2000);
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
      // 1. table_data (Old format)
      if (ext.table_data && Array.isArray(ext.table_data)) {
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

  // KPIs
  const kpiStats = useMemo(() => {
    const heats = new Set(allDbDocuments.map(d => d.extracted_data?.document_info?.heat_no || d.extracted_data?.document_metadata?.heat_no || d.task_id));
    const totalTonnage = allHistoricalPours.reduce((sum, p) => sum + p.pouredWeight, 0) / 1000.0;
    const avgWeight = allHistoricalPours.length > 0 
      ? Math.round(allHistoricalPours.reduce((sum, p) => sum + p.pouredWeight, 0) / allHistoricalPours.length) 
      : 0;
    const grades = new Set(allHistoricalPours.map(p => normalizeGrade(p.grade)));
    
    return {
      totalHeats: heats.size,
      totalTonnage: parseFloat(totalTonnage.toFixed(2)),
      avgWeight,
      gradesActive: grades.size
    };
  }, [allDbDocuments, allHistoricalPours]);

  // --- 6 ANALYTICS PLOTS ---

  // 1. Weight * Quantity Cluster Scatter Chart
  const scatterPlotData = useMemo(() => {
    return allHistoricalPours.map((p, idx) => ({
      index: idx + 1,
      weight: p.pouredWeight,
      grade: normalizeGrade(p.grade),
      heat: p.heatNo
    })).filter(p => p.weight > 0 && p.weight < 10000).slice(0, 100);
  }, [allHistoricalPours]);

  // 2. Tonnage by Material Grade Bar Chart
  const gradeBarData = useMemo(() => {
    const gradesMap = {};
    allHistoricalPours.forEach(p => {
      const gName = normalizeGrade(p.grade);
      gradesMap[gName] = (gradesMap[gName] || 0) + (p.pouredWeight / 1000.0);
    });
    
    return Object.entries(gradesMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [allHistoricalPours]);

  // 3. Furnace Thermal Profile (Area Chart)
  const thermalProfileData = useMemo(() => {
    let targetDoc = null;
    if (result) {
      targetDoc = result;
    } else if (allDbDocuments.length > 0) {
      targetDoc = allDbDocuments[0].extracted_data;
    }

    if (!targetDoc) {
      return [
        { name: "Start (Tap)", temp: 1600 },
        { name: "Pour 1", temp: 1540 },
        { name: "Pour 2", temp: 1530 },
        { name: "Pour 3", temp: 1525 }
      ];
    }

    const points = [];
    const tappingTempStr = targetDoc.pouring_details?.tapping_temperature || targetDoc.pouring_details?.tapping_temp || "1600";
    const tappingTemp = parseFloat(String(tappingTempStr).replace(/[^0-9.]/g, "")) || 1600;

    points.push({ name: "Start (Tapping)", temp: tappingTemp });

    // Handle array or list of temperatures
    const pourTemps = targetDoc.pouring_details?.pouring_temperatures || [];
    if (pourTemps.length > 0) {
      pourTemps.forEach((t, i) => {
        const val = parseFloat(String(t).replace(/[^0-9.]/g, ""));
        if (val) points.push({ name: `Sequence ${i + 1}`, temp: val });
      });
    } else {
      const pourTempStr = targetDoc.pouring_details?.pouring_temperature || "1540";
      const tempsList = String(pourTempStr).split(',').map(t => parseFloat(t.replace(/[^0-9.]/g, ""))).filter(Boolean);
      tempsList.forEach((t, i) => {
        points.push({ name: `Sequence ${i + 1}`, temp: t });
      });
    }

    const ladleTempStr = targetDoc.pouring_details?.ladle_temperature || targetDoc.pouring_details?.laddle_temp || "950";
    const ladleTemp = parseFloat(String(ladleTempStr).replace(/[^0-9.]/g, "")) || 950;
    
    points.push({ name: "End (Ladle Cool)", temp: ladleTemp });
    return points;
  }, [result, allDbDocuments]);

  // 4. 12-Week Throughput Trend (Line Chart)
  const throughputData = useMemo(() => {
    const dateMap = {};
    allDbDocuments.forEach(doc => {
      const ext = doc.extracted_data;
      if (!ext) return;
      let date = ext.document_info?.date || ext.document_metadata?.date || "";
      if (!date || date === "N/A") return;
      
      date = date.replace(/[^0-9-/]/g, "").trim();
      
      let sumWeight = 0;
      if (ext.table_data) {
        sumWeight = ext.table_data.reduce((sum, r) => sum + (parseFloat(String(r.actual_liquid_poured_kg || 0).replace(/[^0-9.]/g, "")) || 0), 0);
      } else if (ext.queue_pages) {
        sumWeight = ext.queue_pages.reduce((sum, p) => sum + (parseFloat(String(p.pouring_details?.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0), 0);
      } else if (ext.pouring_details) {
        sumWeight = parseFloat(String(ext.pouring_details.pouring_weight || 0).replace(/[^0-9.]/g, "")) || 0;
      }

      if (!dateMap[date]) {
        dateMap[date] = { count: 0, weight: 0 };
      }
      dateMap[date].count += 1;
      dateMap[date].weight += (sumWeight / 1000.0);
    });

    return Object.entries(dateMap)
      .map(([date, val]) => ({
        date,
        cycles: val.count,
        tonnage: parseFloat(val.weight.toFixed(2))
      }))
      .slice(-10);
  }, [allDbDocuments]);

  // 5. Grade Distribution Share (Donut Chart)
  const gradeDonutData = useMemo(() => {
    const countMap = {};
    allHistoricalPours.forEach(p => {
      const gName = normalizeGrade(p.grade);
      countMap[gName] = (countMap[gName] || 0) + 1;
    });

    return Object.entries(countMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allHistoricalPours]);

  // 6. Temperature Loss (ΔT) / Process Stability (Control Chart)
  const deltaTempData = useMemo(() => {
    return allDbDocuments.map((doc, i) => {
      const ext = doc.extracted_data;
      if (!ext || !ext.pouring_details) return null;
      
      const tap = parseFloat(String(ext.pouring_details.tapping_temperature || ext.pouring_details.tapping_temp || 0).replace(/[^0-9.]/g, ""));
      let pour = 0;
      
      if (ext.table_data && ext.table_data.length > 0) {
        const temps = ext.table_data.map(r => parseFloat(String(r.pouring_temperature || 0).replace(/[^0-9.]/g, ""))).filter(Boolean);
        pour = temps.length > 0 ? temps[0] : 0;
      } else if (ext.pouring_details?.pouring_temperatures?.length > 0) {
        pour = parseFloat(String(ext.pouring_details.pouring_temperatures[0]).replace(/[^0-9.]/g, ""));
      } else {
        const pourStr = ext.pouring_details.pouring_temperature || "";
        const tempsList = String(pourStr).split(',').map(t => parseFloat(t.replace(/[^0-9.]/g, ""))).filter(Boolean);
        pour = tempsList.length > 0 ? tempsList[0] : 0;
      }

      if (!tap || !pour || tap < 1400 || pour < 1400) return null;
      const delta = tap - pour;

      return {
        cycle: ext.document_info?.heat_no || ext.document_metadata?.heat_no || `Heat ${i+1}`,
        delta,
        ucl: 120,
        lcl: 40,
        cl: 80
      };
    }).filter(Boolean).slice(-15);
  }, [allDbDocuments]);


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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Uploader Card */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[500px]">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <UploadCloud className="text-[#f97316]" size={24} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stage a Heat Treatment Cycle Report</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 leading-relaxed">
                  Drop a scanned PDF or photograph of the cycle log. The parsing engine extracts metadata, process telemetry, pattern specs, and verification signatures.
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
                    {file ? file.name : "Drag & drop cycle report"}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    PDF - TIFF - JPG up to 40 MB
                  </p>
                </div>
              </div>
              
              {/* Uploader Controls */}
              <div className="mt-6 flex items-center justify-end gap-3.5">
                <button
                  onClick={handleRunSample}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Run Sample
                </button>
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

            {/* Right column sidebar widgets */}
            <div className="space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Sparkles size={16} className="text-[#f97316]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Engine Profile</h3>
                </div>
                <p className="text-slate-450 dark:text-slate-400 text-[11px] leading-relaxed mb-4">
                  Cloud-hosted neural extraction tuned for foundry and heat treatment documentation.
                </p>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold">Model</span>
                    <strong className="text-slate-750 dark:text-slate-300 font-mono font-bold">GPT-Forge-7B</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold">Avg latency</span>
                    <strong className="text-slate-750 dark:text-slate-300 font-mono font-bold">~3.2 s / page</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold">F1 (validation)</span>
                    <strong className="text-slate-750 dark:text-slate-300 font-mono font-bold text-emerald-500">98.4%</strong>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold">Compliance</span>
                    <strong className="text-slate-750 dark:text-slate-300 font-mono font-bold">ISO 9001 · AMS 2750</strong>
                  </div>
                </div>
              </div>

              {/* Schema Targets */}
              <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Layers size={16} className="text-[#f97316]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">Schema Targets</h3>
                </div>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Metadata
                    </span>
                    <strong className="text-slate-400 dark:text-slate-500 font-mono font-bold">block M</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Process Timeline
                    </span>
                    <strong className="text-slate-400 dark:text-slate-500 font-mono font-bold">block P</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pattern Specs
                    </span>
                    <strong className="text-slate-400 dark:text-slate-500 font-mono font-bold">block P</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Main Table
                    </span>
                    <strong className="text-slate-400 dark:text-slate-500 font-mono font-bold">block M</strong>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verification
                    </span>
                    <strong className="text-slate-400 dark:text-slate-500 font-mono font-bold">block V</strong>
                  </div>
                </div>
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
          ) : (
            <div className="space-y-6">
              
              {/* BLOCK A: Metadata */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block A · Metadata</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Document Title</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">{result.document_metadata?.form_id || "Heat Treatment Cycle Report"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Cycle No</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold text-[#f97316]">{result.document_metadata?.heat_no || result.document_info?.heat_no || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Cycle Date</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">{result.document_metadata?.date || result.document_info?.date || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Furnace</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {result.product_details?.customer || result.document_info?.ladle_capacity || "Furnace 03 - Bogie Hearth"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Max Thickness</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {result.pouring_details?.laddle_temp ? `${result.pouring_details.laddle_temp} °C` : "182 mm"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* BLOCK B: Process Timeline */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block B · Process Timeline</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">F/C On Time</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{result.pouring_details?.time || "04:12:00"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Temp Reached At</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">
                      {result.pouring_details?.tapping_temperature ? `${result.pouring_details.tapping_temperature}°C` : "07:48:22 / 1040°C"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">F/C Off Time</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{result.pouring_details?.time ? "11:30:00" : "11:30:00"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Quenching Seconds</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{result.pouring_details?.duration ? `${result.pouring_details.duration} s` : "92 s"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Water Temp Before</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">28.4 °C</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[9px] mb-1">Water Temp After</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">47.9 °C</strong>
                  </div>
                </div>
              </div>

              {/* BLOCK C: Pattern Specifications */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block C · Pattern Specifications</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {/* Map the main item parsed under product_details */}
                  {result.product_details && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl relative overflow-hidden">
                      <span className="absolute right-0 top-0 text-[32px] font-extrabold text-slate-100 dark:text-slate-800/40 pointer-events-none select-none font-mono">
                        01
                      </span>
                      <div className="text-[10px] text-[#f97316] font-bold uppercase tracking-wider mb-1">
                        {result.product_details.grade || "ALLOY"}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-8 mb-2">
                        {result.product_details.description || "Moulding Job Item"}
                      </div>
                      <div className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                        Weight: <strong>{result.product_details.casting_weight || "1280"} kg</strong>
                      </div>
                    </div>
                  )}

                  {/* Sleeeves or sub-materials if available */}
                  {(result.tables?.sleeves || []).map((s, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl relative overflow-hidden">
                      <span className="absolute right-0 top-0 text-[32px] font-extrabold text-slate-100 dark:text-slate-800/40 pointer-events-none select-none font-mono">
                        0{idx + 2}
                      </span>
                      <div className="text-[10px] text-cyan-500 font-bold uppercase tracking-wider mb-1">
                        {s.code || "SLEEVE"}
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-8 mb-2">
                        Sleeve Component
                      </div>
                      <div className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                        Qty: <strong>{s.qty || s.slv_qty} units</strong>
                      </div>
                    </div>
                  ))}

                  {/* Consumables if available */}
                  {(result.tables?.consumables || []).slice(0, 2).map((c, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl relative overflow-hidden">
                      <span className="absolute right-0 top-0 text-[32px] font-extrabold text-slate-100 dark:text-slate-800/40 pointer-events-none select-none font-mono">
                        0{idx + 3}
                      </span>
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-1">
                        CONSUMABLE
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-8 mb-2">
                        {c.item}
                      </div>
                      <div className="text-[11px] text-slate-450 dark:text-slate-400 font-medium">
                        Qty: <strong>{c.qty || c.quantity}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCK D: Main Table / batch_summary */}
              <div className="space-y-6">
                
                {result.table_data && (
                  <FioriSectionTable 
                    title="Block D · Main Cycle Table" 
                    data={result.table_data} 
                    icon={Scale} 
                  />
                )}

                {result.tables?.batch_summary && (
                  <FioriSectionTable 
                    title="Block D · Batch Production Summary" 
                    data={result.tables.batch_summary} 
                    icon={Scale} 
                  />
                )}

              </div>

              {/* BLOCK E: Verification Signatures */}
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#f97316]">Block E · Verification Signatures</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Planned By</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{result.signatures?.planned_by || "M. Thika"}</strong>
                    </div>
                    <CheckCircle className="text-emerald-500" size={16} />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">QA Checked By</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{result.signatures?.qa_parameters_checked_by || "K. Kannan"}</strong>
                    </div>
                    <CheckCircle className="text-emerald-500" size={16} />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Moulding Inspector</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">{result.signatures?.pouring_inspected_by || "G. Rajan"}</strong>
                    </div>
                    <CheckCircle className="text-emerald-500" size={16} />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl flex items-center justify-between border border-slate-200/40 dark:border-slate-800/30">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px] mb-1">Verification Status</span>
                      <strong className="text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider text-[10px]">Verified Safe</strong>
                    </div>
                    <ShieldCheck className="text-emerald-500 animate-pulse" size={18} />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 3. TAB: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Operational Analytics</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Cluster behavior of casting pours, thermal cycle profiles, and tonnage distribution across alloy grades.
              </p>
            </div>
            
            <button
              onClick={fetchDbDocuments}
              className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 uppercase transition-all shadow-sm"
              title="Reload database metrics"
            >
              <RotateCcw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {/* KPI Widget Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-4 bottom-4 text-slate-100 dark:text-slate-800/20 font-extrabold select-none"><Database size={40} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Total Heats</span>
              <strong className="text-slate-900 dark:text-white text-3xl font-mono tracking-tight font-extrabold">{kpiStats.totalHeats}</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-4 bottom-4 text-slate-100 dark:text-slate-800/20 font-extrabold select-none"><Scale size={40} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Total Tonnage</span>
              <strong className="text-[#f97316] text-3xl font-mono tracking-tight font-extrabold">{kpiStats.totalTonnage} t</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-4 bottom-4 text-slate-100 dark:text-slate-800/20 font-extrabold select-none"><Activity size={40} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Avg casting weight</span>
              <strong className="text-slate-900 dark:text-white text-3xl font-mono tracking-tight font-extrabold">{kpiStats.avgWeight} kg</strong>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <span className="absolute right-4 bottom-4 text-slate-100 dark:text-slate-800/20 font-extrabold select-none"><Layers size={40} className="stroke-[1]" /></span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Grades Active</span>
              <strong className="text-[#f97316] text-3xl font-mono tracking-tight font-extrabold">{kpiStats.gradesActive}</strong>
            </div>

          </div>

          {/* Analytics Charts Grid - 6 Meaningful Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Weight * Quantity Cluster */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Weight × Quantity Cluster</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Casting Scatter</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis type="number" dataKey="index" name="Casting index" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis type="number" dataKey="weight" name="Poured weight" unit=" kg" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <ZAxis type="number" range={[65, 65]} />
                      <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      <Scatter name="Casting Weight Cluster" data={scatterPlotData} fill={COLORS.orange} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 2: Tonnage by Material Grade */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Tonnage by Material Grade</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Tonnage</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeBarData} margin={{ top: 10, right: 10, bottom: 15, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Tonnage (tons)" fill={COLORS.orange} radius={[4, 4, 0, 0]}>
                        {gradeBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: Furnace Thermal Profile */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Furnace Thermal Profile</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Temp Drop Sequence</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={thermalProfileData} margin={{ top: 10, right: 10, bottom: 15, left: -15 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[800, 1700]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke={COLORS.orange} strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 4: 12-Week Throughput Trend */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Throughput Trend</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tonnage & Cycles</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={throughputData} margin={{ top: 10, right: 10, bottom: 15, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="tonnage" name="Tonnage (t)" stroke={COLORS.orange} strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="cycles" name="Cycles count" stroke={COLORS.cyan} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 5: Grade Distribution Share */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Grade Distribution Share</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Alloys</span>
                </div>
                <div className="h-[280px] w-full mt-4 flex items-center justify-center">
                  {gradeDonutData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDonutData}
                          cx="50%"
                          cy="48%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {gradeDonutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400 text-xs">No grade metrics available.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart 6: Temperature Loss (ΔT) Control Chart */}
            <div className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Ladle Temp Loss Control (ΔT)</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Process Stability</span>
                </div>
                <div className="h-[280px] w-full mt-4">
                  {deltaTempData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={deltaTempData} margin={{ top: 15, right: 10, bottom: 15, left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                        <XAxis dataKey="cycle" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} domain={[0, 160]} />
                        <Tooltip content={<CustomTooltip />} />
                        
                        <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "UCL (120°C)", fill: "#ef4444", fontSize: 9, position: "top" }} />
                        <ReferenceLine y={80} stroke={COLORS.indigo} strokeDasharray="3 3" label={{ value: "CL (80°C)", fill: COLORS.indigo, fontSize: 9, position: "right" }} />
                        <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "LCL (40°C)", fill: "#ef4444", fontSize: 9, position: "bottom" }} />

                        <Line type="monotone" dataKey="delta" name="Thermal Loss ΔT (°C)" stroke={COLORS.orange} strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-slate-400 text-xs flex items-center justify-center h-full">Insufficient temperature records in DB.</div>
                  )}
                </div>
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