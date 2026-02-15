import { useQuery } from '@tanstack/react-query';
import { excelTemplateService } from '@od-erp/api-client';
import { ADMISSION_REPORT_TYPE } from '@od-erp/constants';

/**
 * Hook to fetch list of Excel templates for admission application report
 */
export const useAdmissionTemplates = (entityId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['admissionTemplates', entityId, ADMISSION_REPORT_TYPE],
        queryFn: () => excelTemplateService.listExcelTemplate(entityId, ADMISSION_REPORT_TYPE),
        enabled: enabled && !!entityId,
    });
};

/**
 * Hook to fetch default Excel template heads from API
 * Note: entityType should be passed based on entity configuration (e.g., 'school', 'college')
 */
export const useDefaultAdmissionTemplate = (entityId: string, entityType: string = 'school', enabled: boolean = true) => {
    return useQuery({
        queryKey: ['defaultAdmissionTemplate', ADMISSION_REPORT_TYPE, entityType],
        queryFn: () => excelTemplateService.viewDefaultExcelTemplates(ADMISSION_REPORT_TYPE, entityType),
        enabled: enabled && !!entityId,
    });
};

/**
 * Hook to fetch specific Excel template by ID
 */
export const useAdmissionTemplate = (templateId: string | null, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['admissionTemplate', templateId],
        queryFn: () => excelTemplateService.viewExcelTemplate(templateId!),
        enabled: enabled && !!templateId,
    });
};
