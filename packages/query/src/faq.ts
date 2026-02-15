import { useQuery } from '@tanstack/react-query';
import { faqService } from '@od-erp/api-client';

export const useFaq = (page: string) => {
    return useQuery({
        queryKey: ['faq', page],
        queryFn: () => faqService.listFaq(page),
        enabled: !!page,
        staleTime: 5 * 60 * 1000, // 5 minutes - FAQs don't change often
    });
};
