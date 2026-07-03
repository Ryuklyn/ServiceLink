import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

export const generateReceiptPDF = async (elementId: string, referenceNumber: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const originalWidth = element.style.width;

    try {
        element.style.width = "794px"; // A4 width @ 96 DPI

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#ffffff",
            imageTimeout: 15000, // give the logo time to load
            onclone: (clonedDoc) => {
                const target = clonedDoc.getElementById(elementId);
                if (target) target.style.backgroundColor = "#ffffff";
            },
        });

        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`ServiceLink-Receipt-${referenceNumber}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        throw error;
    } finally {
        element.style.width = originalWidth; // always restore, even on error
    }
};