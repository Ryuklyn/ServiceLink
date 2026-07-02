import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateReceiptPDF = async (elementId: string, referenceNumber: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const originalWidth = element.style.width;
        element.style.width = "794px"; // Standard A4 pixel width representation at 96 DPI

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            // CRITICAL FIX: Sanitize the document stylesheets inside the virtual canvas clone
            onclone: (clonedDoc) => {
                const styleTags = clonedDoc.getElementsByTagName("style");

                for (let i = 0; i < styleTags.length; i++) {
                    const styleTag = styleTags[i];
                    if (styleTag.innerHTML) {
                        let cleanCSS = styleTag.innerHTML;

                        // Tailwind v4 / modern browsers ले oklch()/lab() use garna sakcha,
                        // html2canvas le tinilai parse garna sakdaina — strip garne
                        if (cleanCSS.includes("lab(") || cleanCSS.includes("oklch(")) {
                            cleanCSS = cleanCSS.replace(/[^}]*color:[^;]*oklch\([^)]*\)[^;]*;/g, "");
                            cleanCSS = cleanCSS.replace(/[^}]*background[^;]*oklch\([^)]*\)[^;]*;/g, "");
                            cleanCSS = cleanCSS.replace(/[^}]*border[^;]*oklch\([^)]*\)[^;]*;/g, "");
                            cleanCSS = cleanCSS.replace(/[^}]*color:[^;]*lab\([^)]*\)[^;]*;/g, "");
                            cleanCSS = cleanCSS.replace(/[^}]*background[^;]*lab\([^)]*\)[^;]*;/g, "");
                            styleTag.innerHTML = cleanCSS;
                        }
                    }
                }

                const clonedTarget = clonedDoc.getElementById(elementId);
                if (clonedTarget) {
                    clonedTarget.style.backgroundColor = "#ffffff";
                }
            },
        });

        element.style.width = originalWidth; // Restore user UI state layout width

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // ✅ Fixed: >= 0 ले extra blank page थप्थ्यो, > 0 मा सही हुन्छ
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`ServiceLink-Receipt-${referenceNumber}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        throw error; // ✅ थपियो — caller (ReceiptModal) ले catch गरेर UI मा error देखाउन सकोस्
    }
};