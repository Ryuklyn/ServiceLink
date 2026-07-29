// utils/paymentRedirect.ts
// eSewa-style flow needs an actual <form> POST with signed fields;
// Khalti-style flow is a plain redirect. gatewayFormFields tells us which.
export function redirectToGateway(res: {
    gatewayRedirectUrl: string;
    gatewayMethod: string;
    gatewayFormFields: Record<string, string> | null;
}) {
    const hasFormFields = res.gatewayFormFields && Object.keys(res.gatewayFormFields).length > 0;

    if (!hasFormFields || res.gatewayMethod?.toUpperCase() !== "POST") {
        window.location.href = res.gatewayRedirectUrl;
        return;
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = res.gatewayRedirectUrl;
    form.style.display = "none";

    Object.entries(res.gatewayFormFields!).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
}