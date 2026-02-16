import apiClient from '../client';

export const pdfTemplateService = {
  /**
   * Fetch course-specific PDF templates
   */
  viewDefaultTemplate: async (entityId: string, reportName: string, course?: string) => {
    let url = `/viewDefault/pdfTemplate?entity=${entityId}&report=${reportName}`;
    if (course) {
      url += `&course=${encodeURIComponent(course)}`;
    }
    return apiClient.get(url);
  },

  /**
   * Fetch entity type default PDF templates (fallback)
   */
  viewPDFDefaultTemplates: async (entityType: string, reportName: string) => {
    return apiClient.get(
      `/viewDefault/defaultPDFTemplate?report=${reportName}&entityType=${entityType}`
    );
  }
};
