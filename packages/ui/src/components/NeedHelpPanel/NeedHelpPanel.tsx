import { X } from 'lucide-react';
import { useState } from 'react';
import { useFaq } from '@od-erp/query';

interface FAQ {
    _id: string;
    question: string;
    description: string;
    answer: string;
    videoUrl?: string;
    buttonLabel?: string;
    buttonRedirectURL?: string;
}

interface NeedHelpPanelProps {
    isOpen: boolean;
    onClose: () => void;
    page: string; // e.g., 'applicationData', 'admissionLeads', etc.
}

export const NeedHelpPanel = ({ isOpen, onClose, page }: NeedHelpPanelProps) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Fetch FAQs using React Query
    const { data, isLoading } = useFaq(page);
    const faqs: FAQ[] = data || [];

    const transformYouTubeUrl = (url: string): string => {
        if (!url) return '';
        return url.replace('watch?v=', 'embed/').split('&')[0];
    };

    const handleRedirect = (url: string) => {
        window.open(url, '_blank');
    };

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[99] transition-opacity"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div className="fixed right-0 top-0 h-full w-full md:w-[40%] bg-[var(--color-card)] shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] px-3 py-2 flex justify-between items-center z-10">
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">Answers to your questions</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-muted)] rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : faqs.length > 0 ? (
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={faq._id} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                                    {/* Accordion Header */}
                                    <button
                                        onClick={() => toggleExpand(index)}
                                        className="w-full px-4 py-3 bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-colors flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center flex-1 min-w-0">
                                            <svg
                                                className={`h-4 w-4 text-[var(--color-muted-foreground)] transition-transform flex-shrink-0 ${expandedIndex === index ? 'rotate-90' : ''
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            <div className="ml-3 flex-1 min-w-0">
                                                <span className="font-medium text-[var(--color-foreground)] block">{faq.question}</span>
                                                {expandedIndex !== index && faq.description && (
                                                    <span className="text-sm text-[var(--color-muted-foreground)] block truncate">
                                                        {faq.description.length > 35
                                                            ? `${faq.description.substring(0, 35)}...`
                                                            : faq.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {faq.buttonLabel && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRedirect(faq.buttonRedirectURL || '');
                                                }}
                                                className="ml-2 px-3 py-1 text-sm text-primary hover:text-primary/80 font-medium flex-shrink-0"
                                                title={faq.buttonLabel}
                                            >
                                                {faq.buttonLabel}
                                            </button>
                                        )}
                                    </button>

                                    {/* Accordion Content */}
                                    {expandedIndex === index && (
                                        <div className="p-4 bg-[var(--color-card)] space-y-4">
                                            {/* Video */}
                                            {faq.videoUrl && (
                                                <div className="flex justify-center">
                                                    <iframe
                                                        width="100%"
                                                        height="315"
                                                        src={transformYouTubeUrl(faq.videoUrl)}
                                                        title="YouTube video player"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            )}

                                            {/* Answer */}
                                            <div
                                                className="text-[var(--color-foreground)] prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-[var(--color-muted-foreground)]">
                            *No Data Found
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
