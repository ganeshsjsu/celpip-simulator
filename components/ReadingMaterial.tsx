import React from 'react';

// Use a discriminated union type for better safety
interface ReadingMaterialProps {
    title?: string;
    data: {
        html_content?: string;
        image_src?: string;
        image_alt?: string;
    };
}

export default function ReadingMaterial({ title, data }: ReadingMaterialProps) {
    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto">
            {/* Title is optional or rendered differently based on part, but we can keep it standard */}
            {title && <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">{title}</h2>}

            {data.html_content && (
                <div
                    className="prose prose-blue max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: data.html_content }}
                />
            )}

            {data.image_src && (
                <div className="flex justify-center">
                    {/* Using standard img for simplicity here, but Next/Image is better in prod. 
                Optimized images might be tricky with local arbitrary paths in this proto phase. */}
                    <img
                        src={data.image_src}
                        alt={data.image_alt || "Reading Material"}
                        className="max-w-full h-auto rounded shadow-md border border-gray-200"
                    />
                </div>
            )}
        </div>
    );
}
