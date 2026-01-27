import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sparkles } from "lucide-react";

export interface DealSummary {
  brand: string;
  status: string;
  key_updates: string[];
  next_steps: string[];
  is_new_opportunity?: boolean;
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
              <TableHead className="w-[140px]">Status</TableHead>
              <TableHead>Key Updates</TableHead>
              <TableHead>Next Steps</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableSummaries.map((summary, index) => (
              <TableRow 
                key={`${summary.brand}-${index}`}
                className={summary.is_new_opportunity ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}
              >
                <TableCell className="font-medium align-top">
                  <div className="space-y-1">
                    <Input
                      value={summary.brand}
                      onChange={(e) => handleFieldChange(index, "brand", e.target.value)}
                      className="h-8 text-xs"
                    />
                    {summary.is_new_opportunity && (
                      <Badge variant="outline" className="text-xs gap-1 bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
                        <Sparkles className="w-3 h-3" />
                        New
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <Input
                    value={summary.status}
                    onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                    className={`h-8 text-xs ${summary.is_new_opportunity ? "text-amber-700 dark:text-amber-400" : ""}`}
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
