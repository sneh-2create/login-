import React, { useState, useEffect } from "react";
import { useAppSelector } from "@od-erp/store";
import {
  PageHeader,
  ActionButton,
  Button,
  Input,
  useToast,
  Checkbox,
  useStepOrchestrator,
} from "@od-erp/ui";
import {
  Plus,
  RefreshCw,
  Trash2,
  Save,
  GripVertical,
  Edit2,
  Check,
} from "lucide-react";
import { useAdmissionMaster } from "@od-erp/query";
import { admissionStudentDataService } from "@od-erp/api-client";

const RESERVED_STAGES = ["Approved", "Rejected", "Withdrawn"] as const;
type ReservedStage = (typeof RESERVED_STAGES)[number];

interface StageRow {
  stage: string;
  isEditing?: boolean;
}

const StagesMaster: React.FC<{ onSuccess: (_navigateNext?: boolean) => void; isEmbedded?: boolean }> = ({
  isEmbedded = false,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { registerSaveHandler, setFooterLeftActions, setIsLoading } = useStepOrchestrator();

  const entityId =
    useAppSelector((state: any) => state.auth.entityDetails?.id) || "";
  const session =
    useAppSelector((state: any) => state.session.academicSession) || "";
  const permissions =
    useAppSelector((state: any) => state.auth.permissions) || [];

  const [rows, setRows] = useState<StageRow[]>([]);
  const [reservedActive, setReservedActive] = useState<
    Record<ReservedStage, boolean>
  >({ Approved: false, Rejected: false, Withdrawn: false });
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const {
    data: admissionMaster,
    isLoading,
    refetch,
  } = useAdmissionMaster(entityId, session);
  const canEdit = permissions.includes("viewAdmissionMaster");

  // Populate rows from server — strip reserved stages
  useEffect(() => {
    if (admissionMaster?.stages) {
      const editableStages = (admissionMaster.stages as string[]).filter(
        (s) => !RESERVED_STAGES.includes(s as ReservedStage),
      );
      setRows(editableStages.map((s) => ({ stage: s, isEditing: false })));
      setReservedActive({
        Approved: admissionMaster.stages.includes("Approved"),
        Rejected: admissionMaster.stages.includes("Rejected"),
        Withdrawn: admissionMaster.stages.includes("Withdrawn"),
      });
    }
  }, [admissionMaster]);

  const addRow = () => {
    for (const row of rows) {
      if (!row.stage.trim()) {
        showToast(
          "error",
          "Please fill all stage names before adding a new row",
        );
        return;
      }
    }
    setRows((prev) => [...prev, { stage: "", isEditing: true }]);
  };

  const updateRow = (index: number, value: string) =>
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, stage: value } : row)),
    );

  const toggleEdit = (index: number, isEditing: boolean) => {
    if (!isEditing && !rows[index].stage.trim()) {
      showToast("error", "Stage name cannot be empty");
      return;
    }
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, isEditing } : row)),
    );
  };

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    setRows((prev) => {
      const newRows = [...prev];
      const draggedItem = newRows[draggingIndex];
      newRows.splice(draggingIndex, 1);
      newRows.splice(index, 0, draggedItem);
      return newRows;
    });
    setDraggingIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleSave = async (options?: { navigateNext?: boolean }) => {
    for (const row of rows) {
      if (!row.stage.trim()) {
        showToast("error", "Stage name cannot be empty");
        return;
      }
    }
    setIsLoading(true);
    try {
      const newStages = [
        ...rows.map((r) => r.stage.trim()),
        ...RESERVED_STAGES.filter((r) => reservedActive[r]),
      ];
      await admissionStudentDataService.editAdmissionMaster({
        entity: entityId,
        session,
        stages: newStages,
      });
      showToast("success", "Stages saved successfully");
      refetch();
      if (onSuccess) onSuccess(options?.navigateNext);
    } catch (err: any) {
      showToast("error", err?.response?.data?.message || "Failed to save");
    } finally {
      setIsLoading(true); // Should be false, wait I used setIsLoading(true) in finally in other files by mistake? No, wait.
      setIsLoading(false);
    }
  };

  // Register save handler with Orchestrator
  useEffect(() => {
    if (isEmbedded) {
      registerSaveHandler(handleSave);
    }
  }, [isEmbedded, handleSave, registerSaveHandler]);

  // Register Footer Left Actions
  useEffect(() => {
    if (isEmbedded && canEdit) {
      setFooterLeftActions(
        <Button 
          variant="soft-primary" 
          onClick={addRow} 
          className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/5 font-bold rounded-md transition-all shadow-sm"
        >
          <Plus size={18} /> Add New Stage
        </Button>
      );
    } else {
      setFooterLeftActions(null);
    }
  }, [isEmbedded, canEdit, setFooterLeftActions]);

  const handleReservedToggle = async (
    stage: ReservedStage,
    checked: boolean,
  ) => {
    const newReserved = { ...reservedActive, [stage]: checked };
    setReservedActive(newReserved);
    try {
      const newStages = [
        ...rows.map((r) => r.stage.trim()).filter(Boolean),
        ...RESERVED_STAGES.filter((r) => newReserved[r]),
      ];
      await admissionStudentDataService.editAdmissionMaster({
        entity: entityId,
        session,
        stages: newStages,
      });
      showToast(
        "success",
        `${stage} stage ${checked ? "enabled" : "disabled"}`,
      );
      refetch();
    } catch (err: any) {
      setReservedActive(reservedActive); // rollback
      showToast("error", err?.response?.data?.message || "Failed to update");
    }
  };

  const actionButtons: ActionButton[] = [
    {
      icon: RefreshCw,
      onClick: () => refetch(),
      title: "Refresh",
      className: "text-primary hover:bg-primary/10",
      isVisible: true,
      iconClass: isLoading ? "animate-spin" : "",
      variant: "outline",
    },
  ];

  return (
    <div className="w-full font-sans max-full mx-auto space-y-3">
      {!isEmbedded && (
        <PageHeader
          title="Stages Master Setup"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Admission Setup", href: "/admission/setup" },
            { label: "Admission Master", href: "/admission/setup/master" },
            { label: "Stages Master Setup" },
          ]}
          actionButtons={actionButtons}
        />
      )}

      {/* Top Header Section for embedded mode similar to the design */}
      {isEmbedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-foreground)] m-0">
              Default System Stages
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 mt-1">
              Select the ones applicable to your process.
            </p>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              onClick={addRow}
              className="flex items-center gap-1.5 border-primary text-primary hover:bg-primary/5 px-4 h-9"
            >
              <Plus size={16} /> Add New Details
            </Button>
          )}
        </div>
      )}

      {/* Reserved Stages section at the top */}
      {!isLoading && (
        <div>
          {!isEmbedded && (
            <div className="flex items-center justify-between mb-4 mt-2">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
                  Default System Stages
                </h2>
                <p className="text-sm text-[var(--color-muted-foreground)] m-0">
                  Select the ones applicable to your process.
                </p>
              </div>
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={addRow}
                  className="flex items-center gap-1.5 border-primary text-primary"
                >
                  <Plus size={15} /> Add New Details
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mt-2">
            {RESERVED_STAGES.map((stage) => (
              <label
                key={stage}
                className={`flex items-center gap-3 cursor-pointer pl-2 pr-6 py-2.5 rounded-lg border transition-colors w-54 ${
                  reservedActive[stage]
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-[var(--color-border)] text-[var(--color-muted-foreground)] bg-white dark:bg-[var(--color-background)] hover:border-primary/30"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Checkbox
                  checked={reservedActive[stage]}
                  disabled={!canEdit}
                  onChange={(checked) =>
                    handleReservedToggle(stage, checked)
                  }
                  className="pointer-events-none"
                  containerClassName="m-0 p-0"
                />
                <span
                  className={`text-sm font-semibold select-none ${reservedActive[stage] ? "text-primary" : "text-[var(--color-foreground)]"}`}
                >
                  {stage}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom Stages Section */}
      <div className="pt-2">

        {isLoading ? (
          <div className="flex items-center justify-center p-10 bg-white dark:bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] shadow-sm">
            <RefreshCw size={26} className="animate-spin text-primary" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] shadow-sm text-center">
            <p className="text-[var(--color-muted-foreground)] mb-4 font-medium">
              No custom stages yet.
            </p>
            {canEdit && (
              <Button
                variant="outline"
                onClick={addRow}
                className="flex items-center gap-1.5 border-primary text-primary"
              >
                <Plus size={15} /> Add Stage
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div
                key={i}
                draggable={canEdit && !row.isEditing}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-2 bg-white dark:bg-[var(--color-background)] rounded-lg border shadow-sm transition-all ${row.isEditing ? "border-primary ring-1 ring-primary/20" : "border-[var(--color-border)] hover:border-[var(--color-muted-foreground)]/30"} ${draggingIndex === i ? "opacity-50 border-dashed bg-gray-50 dark:bg-[var(--color-foreground)]/5" : ""}`}
              >
                {/* Grip icon */}
                <div className="text-[var(--color-muted-foreground)] opacity-40 hover:opacity-100 cursor-grab active:cursor-grabbing px-2 py-2 flex-shrink-0">
                  <GripVertical size={20} strokeWidth={2.5} />
                </div>

                <div className="flex-1 flex flex-col pr-4">
                  <label
                    className={`text-[10px] font-bold uppercase tracking-widest ${row.isEditing ? "text-primary" : "text-[var(--color-muted-foreground)]/80"}`}
                  >
                    Enter Value
                  </label>
                  {row.isEditing ? (
                    <Input
                      value={row.stage}
                      onChange={(e) => updateRow(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          toggleEdit(i, false);
                        }
                      }}
                      className="w-full h-10 border-primary focus-visible:ring-primary/20 shadow-sm transition-all"
                      autoFocus
                      placeholder="e.g. Prospectus"
                    />
                  ) : (
                    <span className="text-[15px] font-semibold text-[var(--color-foreground)] flex items-center">
                      {row.stage}
                    </span>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 pr-2">
                    {row.isEditing ? (
                      <Button
                        variant="primary"
                        onClick={() => toggleEdit(i, false)}
                        className="!w-10 !h-10 !p-0 flex items-center justify-center min-w-[40px] shadow-sm"
                        title="Confirm edit"
                      >
                        <Check size={18} />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => toggleEdit(i, true)}
                        className="!w-9 !h-9 !p-0 flex items-center justify-center min-w-[36px] text-[var(--color-muted-foreground)] hover:text-primary hover:border-primary hover:bg-transparent shadow-none transition-colors border-[var(--color-border)]"
                        title="Edit stage"
                      >
                        <Edit2 size={15} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => removeRow(i)}
                      className="!w-9 !h-9 !p-0 flex items-center justify-center min-w-[36px] text-red-400 hover:text-red-600 hover:border-red-600 hover:bg-transparent shadow-none transition-colors border-red-400"
                      title="Remove stage"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLoading && canEdit && !isEmbedded && (
        <div className="flex justify-end mt-8">
          <Button
            variant="primary"
            onClick={() => handleSave()}
            disabled={isLoading}
            className="flex items-center gap-2 px-10 h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          >
            <Save size={18} /> Save Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default StagesMaster;
