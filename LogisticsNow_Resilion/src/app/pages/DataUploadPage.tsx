import { useState, useRef } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Upload, FileSpreadsheet, CheckCircle2, Play, AlertCircle, Info, X, FileText, Loader2 } from "lucide-react";
import * as XLSX from 'xlsx';

// Function to map uploaded columns to expected field names
const mapColumnToField = (columnName: string): string => {
  const columnLower = columnName.toLowerCase();
  
  if (columnLower.includes('order') || columnLower.includes('shipment') || columnLower.includes('id')) return 'Shipment ID';
  if (columnLower.includes('origin') || columnLower.includes('pickup')) return 'Origin';
  if (columnLower.includes('destination') || columnLower.includes('drop')) return 'Destination';
  if (columnLower.includes('carrier') || columnLower.includes('agent')) return 'Carrier';
  if (columnLower.includes('freight') || columnLower.includes('rate') || columnLower.includes('cost')) return 'Freight Rate';
  if (columnLower.includes('equipment') || columnLower.includes('vehicle') || columnLower.includes('truck')) return 'Equipment Type';
  if (columnLower.includes('pickup') || columnLower.includes('date') || columnLower.includes('timestamp')) return 'Pickup Date';
  if (columnLower.includes('weight') || columnLower.includes('kg') || columnLower.includes('lbs')) return 'Weight';
  
  return columnName;
};

export function DataUploadPage() {
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [validationResults, setValidationResults] = useState({
    requiredFieldsDetected: false,
    fileFormatValid: false,
    duplicateIds: 0,
    missingRates: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);
    setFileName(file.name);

    try {
      const data = await readFileData(file);
      setFileData(data.slice(0, 10));
      setFileHeaders(Object.keys(data[0] || {}));
      setTotalRecords(data.length);
      
      // Run validation checks
      validateDataset(data);
      
      setUploaded(true);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please check the file format.");
    }
  };

  const readFileData = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const text = data as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            const parsedData = lines.slice(1)
              .filter(line => line.trim() !== '')
              .map(line => {
                const values = line.split(',').map(v => v.trim());
                const row: any = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                return row;
              });
            
            resolve(parsedData);
          } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // Parse Excel
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } else {
            reject(new Error('Unsupported file format'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    });
  };

  const validateDataset = (data: any[]) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    
    // Check if required fields are detected
    const mappedFields = headers.map(h => mapColumnToField(h));
    const requiredFields = ['Shipment ID', 'Origin', 'Destination', 'Carrier', 'Freight Rate', 'Equipment Type', 'Pickup Date', 'Weight'];
    const requiredFieldsDetected = requiredFields.some(f => 
      mappedFields.includes(f)
    );

    // Check for duplicate IDs
    const idColumn = headers.find(h => 
      h.toLowerCase().includes('id') || h.toLowerCase().includes('order')
    );
    
    let duplicateIds = 0;
    if (idColumn) {
      const ids = data.map(row => row[idColumn]);
      const idSet = new Set();
      ids.forEach(id => {
        if (idSet.has(id)) duplicateIds++;
        else idSet.add(id);
      });
    }

    // Check for missing freight rates
    const rateColumn = headers.find(h => 
      h.toLowerCase().includes('freight') || 
      h.toLowerCase().includes('rate') || 
      h.toLowerCase().includes('cost')
    );
    
    let missingRates = 0;
    if (rateColumn) {
      missingRates = data.filter(row => !row[rateColumn] || row[rateColumn] === '').length;
    }

    setValidationResults({
      requiredFieldsDetected,
      fileFormatValid: true,
      duplicateIds,
      missingRates,
    });
  };

  const handleFileUpload = (file: File) => {
    processFile(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setUploaded(false);
    setFileName("");
    setFileSize("");
    setFileData([]);
    setFileHeaders([]);
    setTotalRecords(0);
    setValidationResults({
      requiredFieldsDetected: false,
      fileFormatValid: false,
      duplicateIds: 0,
      missingRates: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 🔥 FIXED: handleRunCleaningEngine - Single source of truth
  const handleRunCleaningEngine = async () => {
    setIsCleaning(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) {
        alert("No file selected");
        setIsCleaning(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      console.log("🚀 Sending file to backend:", fileInput.files[0].name);

      const response = await fetch(`${backendUrl}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("✅ Backend Response:", data);

      // 🔥 SINGLE SOURCE OF TRUTH - ONLY this key is used everywhere
      sessionStorage.setItem("laneAnalysisResults", JSON.stringify(data));
      
      // ❌ REMOVED: sessionStorage.setItem("backendResults", ...)
      // ❌ REMOVED: sessionStorage.setItem('cleaningResults', ...)

      // Navigate to cleaning page
      window.location.href = "/cleaning";

    } catch (error) {
      console.error("❌ Backend error:", error);
      alert("Backend error. Please check if the server is running at http://127.0.0.1:8000");
    } finally {
      setIsCleaning(false);
    }
  };

  // Helper function to generate before/after comparison data based on actual uploaded data
  const generateBeforeAfterData = (data: any[], headers: string[]) => {
    const beforeAfterExamples = [];
    
    // Find relevant columns
    const originCol = headers.find(h => h.toLowerCase().includes('origin') || h.toLowerCase().includes('pickup'));
    const destCol = headers.find(h => h.toLowerCase().includes('destination') || h.toLowerCase().includes('drop'));
    const equipmentCol = headers.find(h => h.toLowerCase().includes('vehicle') || h.toLowerCase().includes('equipment'));
    const weightCol = headers.find(h => h.toLowerCase().includes('weight'));
    const carrierCol = headers.find(h => h.toLowerCase().includes('carrier') || h.toLowerCase().includes('agent'));
    
    if (originCol && data[0]) {
      beforeAfterExamples.push({
        id: 1,
        field: "Origin",
        before: data[0][originCol] || "NY, New York",
        after: formatOrigin(data[0][originCol] || "New York, NY"),
        status: "cleaned",
      });
    }
    
    if (equipmentCol && data[0]) {
      beforeAfterExamples.push({
        id: 2,
        field: "Equipment",
        before: data[0][equipmentCol] || "53' Dry Van",
        after: formatEquipment(data[0][equipmentCol] || "Dry Van 53ft"),
        status: "standardized",
      });
    }
    
    if (weightCol && data[0]) {
      beforeAfterExamples.push({
        id: 3,
        field: "Weight",
        before: data[0][weightCol] || "15,000 lbs",
        after: formatWeight(data[0][weightCol] || "15000"),
        status: "cleaned",
      });
    }
    
    if (destCol && data[1]) {
      beforeAfterExamples.push({
        id: 4,
        field: "Destination",
        before: data[1][destCol] || "L.A., CA",
        after: formatDestination(data[1][destCol] || "Los Angeles, CA"),
        status: "cleaned",
      });
    }
    
    if (carrierCol && data[2]) {
      beforeAfterExamples.push({
        id: 5,
        field: "Carrier",
        before: data[2][carrierCol] || "Federal Express",
        after: formatCarrier(data[2][carrierCol] || "FedEx"),
        status: "standardized",
      });
    }
    
    return beforeAfterExamples;
  };

  // Formatting helper functions
  const formatOrigin = (value: string): string => {
    if (value.includes('NY')) return 'New York, NY';
    return value;
  };

  const formatDestination = (value: string): string => {
    if (value.includes('L.A.')) return 'Los Angeles, CA';
    return value;
  };

  const formatEquipment = (value: string): string => {
    if (value.includes('53')) return 'Dry Van 53ft';
    return value;
  };

  const formatWeight = (value: string): string => {
    return value.replace(/,/g, '').replace(' lbs', '');
  };

  const formatCarrier = (value: string): string => {
    if (value.includes('Federal')) return 'FedEx';
    return value;
  };

  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Data Upload</h1>
        <p className="text-muted-foreground">
          Upload your shipment dataset for processing
        </p>
      </div>

      {/* Upload Area */}
      <Card className="p-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".csv,.xlsx,.xls"
          className="hidden"
        />
        
        {uploaded ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full">
                  <FileText className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{fileName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {totalRecords.toLocaleString()} records • {fileSize} • Uploaded successfully
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBrowseClick}>
                Upload Different File
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-secondary bg-secondary/5"
                : "border-border hover:border-secondary hover:bg-secondary/5"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3>Upload Shipment Dataset</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your logistics shipment dataset here or click to browse.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <FileSpreadsheet className="w-4 h-4" />
                Supported formats: CSV, XLSX
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Upload historical shipment data for lane analysis and procurement optimization.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Dataset Validation Card */}
      {uploaded && (
        <Card className="p-6">
          <h3>Dataset Validation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Automated checks on the uploaded dataset structure.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {validationResults.requiredFieldsDetected ? (
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="text-sm">
                {validationResults.requiredFieldsDetected 
                  ? "Required fields detected" 
                  : "Some required fields may be missing"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {validationResults.fileFormatValid ? (
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">File format valid</span>
            </div>
            <div className="flex items-center gap-3">
              {validationResults.duplicateIds > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              )}
              <span className="text-sm">
                {validationResults.duplicateIds > 0 
                  ? `${validationResults.duplicateIds} duplicate shipment IDs detected`
                  : "No duplicate IDs found"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {validationResults.missingRates > 0 ? (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              )}
              <span className="text-sm">
                {validationResults.missingRates > 0
                  ? `${validationResults.missingRates} missing freight rate values`
                  : "All freight rates present"}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Green checks indicate valid checks, yellow warnings need attention</span>
            </div>
          </div>
        </Card>
      )}

      {/* Dataset Preview */}
      {uploaded && fileData.length > 0 && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Dataset Preview</h3>
              <span className="text-sm text-muted-foreground">
                Showing first {fileData.length} of {totalRecords.toLocaleString()} records
              </span>
            </div>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white dark:bg-gray-950 z-10">
                  <TableRow>
                    {fileHeaders.map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap">
                        {header}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          ({mapColumnToField(header)})
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="odd:bg-muted/50">
                      {fileHeaders.map((header, colIndex) => (
                        <TableCell key={colIndex} className="whitespace-nowrap">
                          {formatCellValue(row[header])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 min-w-[200px]"
              onClick={handleRunCleaningEngine}
              disabled={isCleaning}
            >
              {isCleaning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Cleaning Engine
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}