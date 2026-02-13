import apiClient from '../client';

export interface FAQ {
    _id: string;
    question: string;
    description: string;
    answer: string;
    videoUrl?: string;
    buttonLabel?: string;
    buttonRedirectURL?: string;
    page: string;
}

export const faqService = {
    listFaq: async (page: string) => {
        // Angular: URLAddress('/list/faq?page='+page)
        const response = await apiClient.get(`/list/faq?page=${page}`);
        return response.data;
    },
};
