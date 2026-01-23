import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DealSummary {
  brand: string;
  status: string;
  key_updates: string[];
  next_steps: string[];
}

interface CanvasPreviewTableProps {
  dealSummaries: DealSummary[];
  weekRange: string;
  onSummariesChange: (summaries: DealSummary[]) => void;
}

export const CanvasPreviewTable = ({
  dealSummaries,
  weekRange,
  onSummariesChange,
}: CanvasPreviewTableProps) => {
  const [editableSummaries, setEditableSummaries] = useState<DealSummary[]>(dealSummaries);

  useEffect(() => {
    setEditableSummaries(dealSummaries);
  }, [dealSummaries]);

  const handleFieldChange = (
    index: number,
    field: keyof DealSummary,
    value: string | string[]
  ) => {
    const updated = [...editableSummaries];
    if (field === "key_updates" || field === "next_steps") {
      // Split by newlines for array fields
      updated[index] = { ...updated[index], [field]: (value as string).split("\n").filter(v => v.trim()) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEditableSummaries(updated);
    onSummariesChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-primary">
        📅 Week of {weekRange}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Brand</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Key Updates</TableHead>
              <TableHead>Next Steps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableSummaries.map((summary, index) => (
              <TableRow key={`${summary.brand}-${index}`}>
                <TableCell className="font-medium align-top">
                  <Input
                    value={summary.brand}
                    onChange={(e) => handleFieldChange(index, "brand", e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="align-top">
                  <Input
                    value={summary.status}
                    onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                    className="h-8 text-xs"
                  />
                </TableCell>
                <TableCell className="align-top">
                  <textarea
                    value={summary.key_updates.join("\n")}
                    onChange={(e) => handleFieldChange(index, "key_updates", e.target.value)}
                    className="w-full min-h-[60px] text-xs p-2 rounded-md border border-input bg-background resize-y"
                    placeholder="One update per line"
                  />
                </TableCell>
                <TableCell className="align-top">
                  <textarea
                    value={summary.next_steps.join("\n")}
                    onChange={(e) => handleFieldChange(index, "next_steps", e.target.value)}
                    className="w-full min-h-[60px] text-xs p-2 rounded-md border border-input bg-background resize-y"
                    placeholder="One step per line"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
