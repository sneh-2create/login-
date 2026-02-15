import { Button, DataTable } from '@od-erp/ui';
import { X } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface DuplicateStudent {
  _id: string;
  name: string;
  phone: string;
  applicationNumber: string;
  course: string;
  stream: string;
  status: string;
}

interface DuplicateNumbersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkDuplicate: () => void;
  onNoDuplicate: () => void;
  duplicateStudents: DuplicateStudent[];
  displayNames: {
    course: string;
    stream: string;
  };
}

export const DuplicateNumbersDialog = ({ 
  isOpen, 
  onClose, 
  onMarkDuplicate, 
  onNoDuplicate, 
  duplicateStudents,
  displayNames
}: DuplicateNumbersDialogProps) => {
  
  const columns: ColumnDef<DuplicateStudent>[] = [
    { accessorKey: 'applicationNumber', header: 'Application No' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'phone', header: 'Phone' },
    { accessorKey: 'course', header: displayNames.course },
    { accessorKey: 'stream', header: displayNames.stream },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: info => (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-primary-100 text-primary-800">
          {(info.getValue() as string).toUpperCase()}
        </span>
      )
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Duplicate Records Found</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-auto flex-1">
          <p className="text-sm text-gray-600 mb-4">
            The following student records already exist with this phone number. Do you want to mark this as a duplicate?
          </p>
          <DataTable 
            columns={columns} 
            data={duplicateStudents} 
            showSearch={false}
          />
        </div>

        <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onNoDuplicate}>
            No, Not a Duplicate
          </Button>
          <Button onClick={onMarkDuplicate}>
            Yes, Mark as Duplicate
          </Button>
        </div>
      </div>
    </div>
  );
};
