import React, { createContext, useContext, useState, useEffect } from "react";

const QuotationContext = createContext();

export const useQuotation = () => useContext(QuotationContext);

export const QuotationProvider = ({ children }) => {

    const formatDate = (date) => {
        const d = new Date(date)
        const day = String(d.getDate()).padStart(2, "0")
        const month = String(d.getMonth() + 1).padStart(2, "0")
        const year = d.getFullYear()
        return `${day}-${month}-${year}`
    }
    const formatDateToBackend = (dateStr) => {
        if (!dateStr) return null;

        // if already Date object
        if (dateStr instanceof Date) {
            const d = dateStr;
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${year}-${month}-${day}`;
        }

        // if string in DD-MM-YYYY
        if (typeof dateStr === "string" && dateStr.includes("-")) {
            const [day, month, year] = dateStr.split("-");
            return `${year}-${month}-${day}`;
        }

        return dateStr;
    };


    const calculateFollowUpDate = (validityNumber, validityType) => {
        const today = new Date()
        const followUpDate = new Date(today)

        if (validityType === "days") {
            followUpDate.setDate(today.getDate() + Number.parseInt(validityNumber))
        } else if (validityType === "months") {
            followUpDate.setMonth(today.getMonth() + Number.parseInt(validityNumber))
        }

        return formatDate(followUpDate)
    }


    const [showPreview, setShowPreview] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [customerSearchQuery, setCustomerSearchQuery] = useState("");
    const [customerSearchResults, setCustomerSearchResults] = useState([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [availableTerms, setAvailableTerms] = useState([]);
    const [selectedTerms, setSelectedTerms] = useState([]);
    const [termsSearchQuery, setTermsSearchQuery] = useState("");
    const [showTermsDropdown, setShowTermsDropdown] = useState(false);
    const [productSearchStates, setProductSearchStates] = useState({});
    const [productSearchResults, setProductSearchResults] = useState({});
    const [isSearchingProducts, setIsSearchingProducts] = useState({});
    const [formData, setFormData] = useState({
        quotationDate: formatDate(new Date()), // Auto-set to today's date
        validUntil: "",
        validityNumber: 30, // Added validity number field
        validityType: "days", // Added validity type field (days/months)
        followUpDate: "", // Added follow-up date field
        customerName: "",
        companyName: "",
        email: "",
        phone: "",
        address: "",
        products: [{ id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0 }],
        subtotal: "0.00",
        discount: "",
        tax: "0.00",    
        taxRate: "18",
        discountType: "amount",
        totalAmount: "0.00",
        additionalNotes: "",
        createdBy: "Admin User",
        digitalSignature: "",
    });

    // Fetch terms on mount
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/terms/", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                if (data) setAvailableTerms(data);
            } catch (error) {
                console.error("Error fetching terms:", error);
            }
        };
        fetchTerms();
    }, []);

    const handleSaveProduct = async (name, selling_price) => {
        try {
            const token = localStorage.getItem("token")

            const payload = {
                name: name,
                selling_price: Number(selling_price),
            }

            console.log("Sending payload:", payload)

            const res = await fetch(
                "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/products/create/",
                {
                    method: "POST",

                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            )

            if (!res.ok) throw new Error("Failed to save product")
            const data = await res.json()
            return data?.data?.id
        } catch (err) {
            console.error("Error saving product:", err)
        }
    }

    // Handlers

    // Create Quotation handler
    const createQuotation = async () => {

        try {
            const token = localStorage.getItem("token");

            // Build items array asynchronously
            const items = await Promise.all(
                formData.products.map(async (p) => {
                    if (!p.id) {
                        const id = await handleSaveProduct(p.name, p.selling_price);
                        return {
                            product: id,
                            name: p.name,
                            quantity: p.quantity,
                            unit_price: p.selling_price ? Number(p.selling_price) : 0,
                            discount: p.percentage_discount ? Number(p.percentage_discount) : 0,
                        };
                    } else {
                        return {
                            product: p.id,
                            name: p.name,
                            quantity: p.quantity,
                            unit_price: p.selling_price ? Number(p.selling_price) : 0,
                            discount: p.percentage_discount ? Number(p.percentage_discount) : 0,
                        };
                    }
                })
            );

            const payload = {
                customer: {
                    name: formData.customerName,
                    email: formData.email,
                    phone: formData.phone,
                    company_name: formData.companyName,
                    primary_address: formData.address,
                },
                auto_assign: true,
                status: "PENDING",
                discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
                tax_rate:formData.taxRate,
                discount_type: formData.discountType,
                follow_up_date: formatDateToBackend(formData.validUntil),
                terms: selectedTerms,
                items,
            };
            console.log("Creating quotation with payload:", payload);
            const response = await fetch(
                "https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/quotations/create/",

                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to create quotation: ${response.status} - ${errorText}`
                );
            }
            const result = await response.json();
            console.log("Quotation created successfully:", result);
            alert("Quotation created and sent successfully!");
        } catch (error) {
            alert("Error creating quotation. Please try again.");
        }
    };

    // Download PDF handler (dummy, replace with your logic)
    const downloadPDF = () => {
        alert("Download PDF logic goes here.");
    };
    const updateFormData = (field, value) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value }

            if (field === "validityNumber" || field === "validityType") {
                const validityNumber = field === "validityNumber" ? value : prev.validityNumber
                const validityType = field === "validityType" ? value : prev.validityType
                updated.followUpDate = calculateFollowUpDate(validityNumber, validityType)
                updated.validUntil = updated.followUpDate
            }

            return updated
        })
    }

    const updateProduct = (product, productIndex) => {
        console.log(product)
        const updatedProducts = [...formData.products];
        const index = updatedProducts.findIndex((p) => p.id === product.id);
        if (index !== -1) {
            updatedProducts[index] = { ...updatedProducts[index], ...product };
        } else {
            updatedProducts[productIndex] = { ...updatedProducts[productIndex], ...product };
        }
        setFormData((prev) => ({ ...prev, products: updatedProducts }));
        calculateTotals(updatedProducts);
    };

    const searchProducts = async (query, productIndex) => {
        if (!query.trim()) {
            setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }));
            return;
        }
        setIsSearchingProducts((prev) => ({ ...prev, [productIndex]: true }));
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/products/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json()

            const newProduct = { id: "", name: query.trim(), quantity: 1, selling_price: 0, percentage_discount: 0 }

            data?.data.push(newProduct);

            const filtered = (data.data || []).filter((product) =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
            );
            setProductSearchResults((prev) => ({ ...prev, [productIndex]: filtered || [] }));
        } catch (error) {
            setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }));
        } finally {
            setIsSearchingProducts((prev) => ({ ...prev, [productIndex]: false }));
        }
    };

    const generatePDFAndSend = async () => {
        setIsGeneratingPDF(true)

        try {
            console.log("[v0] Starting PDF generation...")

            // For now, just send the form data to backend without PDF generation
            // You can add PDF generation library later
            const response = await fetch("/api/quotations/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quotationData: formData,
                    timestamp: new Date().toISOString(),
                }),
            })

            if (response.ok) {
                const result = await response.json()
                console.log("[v0] Quotation sent successfully:", result)
                alert("Quotation created and sent successfully!")
            } else {
                throw new Error("Failed to send quotation to backend")
            }
        } catch (error) {
            console.error("[v0] Error sending quotation to backend:", error)
            alert("Error creating quotation. Please try again.")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const selectProduct = (product, productIndex, name) => {
        const mapped = {
            id: product.id,
            name: name || product.name,
            description: product.description ?? "",
            selling_price: Number(product.selling_price),
            cost_price: Number(product.cost_price ?? 0),
            tax_rate: Number(product.tax_rate ?? 0),
            unit: product.unit ?? "",
            brand: product.brand ?? "",
            weight: product.weight ?? null,
            warranty_months: product.warranty_months ?? null,
            // preserve existing row values
            quantity: formData.products[productIndex]?.quantity ?? 1,
            percentage_discount: formData.products[productIndex]?.percentage_discount ?? 0,
        }

        updateProduct(mapped, productIndex)

        setProductSearchStates((prev) => ({
            ...prev,
            [productIndex]: {
                ...(prev[productIndex] || {}),
                query: mapped.name,
                showResults: false,
            },
        }))
        setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }))

        // Optional: If you want the global tax to follow the selected product's tax_rate, uncomment:
        // setFormData((prev) => ({ ...prev, taxRate: String(mapped.tax_rate || prev.taxRate) }));
    }

    const handleChangeProductDetail = (e, productIndex) => {
        const { name, value } = e.target;

        let parsedValue;
        if (name === "quantity") {
            parsedValue = parseInt(value) || 0;
        } else if (name === "selling_price" || name === "percentage_discount") {
            parsedValue = parseFloat(value) || 0;
        } else {
            parsedValue = value;
        }

        setFormData((prev) => {
            const updatedProducts = [...prev.products];
            updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                [name]: parsedValue,
            };
            return { ...prev, products: updatedProducts };
        });

        // Recalculate totals after updating
        calculateTotals(
            formData.products.map((p, i) =>
                i === productIndex ? { ...p, [name]: parsedValue } : p
            )
        );
    };


    const handleProductSearchChange = (e, productIndex) => {
        const query = e.target.value;
        setProductSearchStates((prev) => ({
            ...prev,
            [productIndex]: {
                query,
                showResults: query.trim().length > 0,
            },
        }));
        setFormData((prev) => {
            const updatedProducts = [...prev.products];
            updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                name: query,
            };
            return { ...prev, products: updatedProducts };
        });
        if (query.trim()) {
            searchProducts(query, productIndex);
        } else {
            setProductSearchResults((prev) => ({ ...prev, [productIndex]: [] }));
        }
    };

    const addProductRow = () => {
        const newProducts = [...formData.products, { id: "", name: "", quantity: 1, selling_price: 0 }];
        setFormData((prev) => ({ ...prev, products: newProducts }));
    };

    const removeProductRow = (index) => {
        if (formData.products.length > 1) {
            const updatedProducts = formData.products.filter((_, i) => i !== index);
            setFormData((prev) => ({ ...prev, products: updatedProducts }));
            calculateTotals(updatedProducts);
            setProductSearchStates((prev) => {
                const newStates = {};
                formData.products.forEach((_, i) => {
                    if (i < index) newStates[i] = prev[i];
                    else if (i > index) newStates[i - 1] = prev[i];
                });
                return newStates;
            });
            setProductSearchResults((prev) => {
                const newResults = { ...prev };
                delete newResults[index];
                return newResults;
            });
            setIsSearchingProducts((prev) => {
                const newSearching = { ...prev };
                delete newSearching[index];
                return newSearching;
            });
        }
    };

    const calculateTotals = (products = formData.products) => {
        const subtotal = products.reduce((sum, product) => {
            const baseAmount = (product.quantity || 0) * (product.selling_price || 0)
            const discount = product.percentage_discount ? (baseAmount * product.percentage_discount) / 100 : 0
            return sum + (baseAmount - discount)
        }, 0)

        const taxRate = Number.parseFloat(formData.taxRate) || 0
        const tax = (subtotal * taxRate) / 100

        let globalDiscount = 0
        if (formData.specialDiscountEnabled) {
            const discountValue = Number.parseFloat(formData.discount) || 0
            if (formData.discountType === "percentage") {
                globalDiscount = (subtotal * discountValue) / 100
            } else {
                globalDiscount = discountValue
            }
        }


        const totalAmount = subtotal + tax - globalDiscount

        setFormData((prev) => ({
            ...prev,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            discount: prev.discount,
        }))
    }


    const searchCustomers = async (query) => {
        if (!query.trim()) {
            setCustomerSearchResults([]);
            return;
        }
        setIsSearchingCustomers(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://4g1hr9q7-8000.inc1.devtunnels.ms/quotations/api/customers/", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();
            const filtered = (data.data || []).filter((customer) =>
                customer.name.toLowerCase().includes(query.toLowerCase()) ||
                (customer.phone && customer.phone.toLowerCase().includes(query.toLowerCase())) ||
                (customer.company_name && customer.company_name.toLowerCase().includes(query.toLowerCase()))
            );
            setCustomerSearchResults(filtered);
        } catch (error) {
            setCustomerSearchResults([]);
        } finally {
            setIsSearchingCustomers(false);
        }
    };

    const selectCustomer = (customer) => {
        setFormData((prev) => ({
            ...prev,
            customerId: customer.id,
            customerName: customer.name,
            companyName: customer.company_name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
        }));
        setCustomerSearchQuery(customer.name);
        setShowCustomerSearch(false);
        setCustomerSearchResults([]);
    };

    const handleCustomerSearchChange = (e) => {
        const query = e.target.value;
        setCustomerSearchQuery(query);
        if (query.trim()) {
            setShowCustomerSearch(true);
            searchCustomers(query);
        } else {
            setShowCustomerSearch(false);
            setCustomerSearchResults([]);
        }
    };

    const handleTermSelection = (termId) => {
        const updatedSelectedTerms = selectedTerms.includes(termId)
            ? selectedTerms.filter((id) => id !== termId)
            : [...selectedTerms, termId];
        setSelectedTerms(updatedSelectedTerms);
        setFormData((prev) => ({
            ...prev,
            selectedTerms: updatedSelectedTerms,
        }));
    };

    const filteredTerms = availableTerms.filter(
        (term) =>
            term.title.toLowerCase().includes(termsSearchQuery.toLowerCase()) ||
            term.content_html.toLowerCase().includes(termsSearchQuery.toLowerCase())
    );

    return (
        <QuotationContext.Provider
            value={{
                showPreview, setShowPreview,
                isGeneratingPDF, setIsGeneratingPDF,
                showCustomerSearch, setShowCustomerSearch,
                customerSearchQuery, setCustomerSearchQuery,
                customerSearchResults, setCustomerSearchResults,
                isSearchingCustomers, setIsSearchingCustomers,
                availableTerms, setAvailableTerms,
                selectedTerms, setSelectedTerms,
                termsSearchQuery, setTermsSearchQuery,
                showTermsDropdown, setShowTermsDropdown,
                productSearchStates, setProductSearchStates,
                productSearchResults, setProductSearchResults,
                isSearchingProducts, setIsSearchingProducts,
                formData, setFormData,
                updateFormData,
                updateProduct,
                searchProducts,
                selectProduct,
                handleChangeProductDetail,
                handleProductSearchChange,
                addProductRow,
                removeProductRow,
                calculateTotals,
                searchCustomers,
                selectCustomer,
                handleCustomerSearchChange,
                handleTermSelection,
                filteredTerms,
                createQuotation,
                downloadPDF,
            }}
        >
            {children}
        </QuotationContext.Provider>
    );
};