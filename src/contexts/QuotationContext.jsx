import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2"
const baseUrl = import.meta.env.VITE_BASE_URL;


const QuotationContext = createContext();

export const useQuotation = () => useContext(QuotationContext);

export const QuotationProvider = ({ children }) => {

    const { id } = useParams();
    const location = useLocation();

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
    const [companySearchResults, setCompanySearchResults] = useState([]);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [availableTerms, setAvailableTerms] = useState([]);
    const [selectedTerms, setSelectedTerms] = useState([]);
    const [termsSearchQuery, setTermsSearchQuery] = useState("");
    const [showTermsDropdown, setShowTermsDropdown] = useState(false);
    const [productSearchStates, setProductSearchStates] = useState({});
    const [productSearchResults, setProductSearchResults] = useState({});
    const [isSearchingProducts, setIsSearchingProducts] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [pageLoading, setPageLoading] = useState(false);

    const [leadSearchQuery, setLeadSearchQuery] = useState("");
    const [leadSearchResults, setLeadSearchResults] = useState([]);
    const [isSearchingLeads, setIsSearchingLeads] = useState(false);
    const [showLeadSearch, setShowLeadSearch] = useState(false);

    const [formData, setFormData] = useState({
        quotationDate: formatDate(new Date()), // Auto-set to today's date
        validUntil: formatDate(new Date()),
        validityNumber: 0, // Added validity number field
        validityType: "days", // Added validity type field (days/months)
        followUpDate: "", // Added follow-up date field
        customerName: "",
        companyName: "",
        email: "",
        phone: "",
        address: "",
        gst_number: "",
        additional_charge_name: "",
        additional_charge_amount: 0,
        products: [{ id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0, imageUrl: "" }],
        subtotal: "0.00",
        discount: "",
        tax: "0.00",
        taxRate: "18",
        discountType: "amount",
        totalAmount: "0.00",
        additionalNotes: "",
        status: "",
        createdBy: localStorage.getItem("role"),
        digitalSignature: "",
        send_immediately: false,
        lead_id: null,
        is_tax_inclusive: false,
    });


    useEffect(() => {
    }, [formData])


    useEffect(() => {
        calculateTotals();
    }, [formData.products, formData.taxRate, formData.discount, formData.discountType, formData.additional_charge_amount, formData.is_tax_inclusive]);

    useEffect(() => {
        if (!id) {
            setFormData({
                quotationDate: formatDate(new Date()), // Auto-set to today's date
                validUntil: formatDate(new Date()),
                validityNumber: 0, // Added validity number field
                validityType: "days", // Added validity type field (days/months)
                followUpDate: "", // Added follow-up date field
                customerName: "",
                companyName: "",
                email: "",
                phone: "",
                address: "",
                gst_number: "",
                additional_charge_name: "",
                additional_charge_amount: 0,
                products: [{ id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0, imageUrl: "" }],
                subtotal: "0.00",
                discount: "",
                tax: "0.00",
                taxRate: "18",
                discountType: "amount",
                totalAmount: "0.00",
                additionalNotes: "",
                status: "",
                createdBy: localStorage.getItem("role"),
                digitalSignature: "",
                lead_id: null,
                is_tax_inclusive: false,
            })

        } else {
            fetchQuotation();
        }
    }, [id]);

    const searchLeads = async (query, customerName) => {
        if (!query.trim()) {
            setLeadSearchResults([]);
            return;
        }
        setIsSearchingLeads(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${baseUrl}/quotations/api/leads/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();

            // Filter leads by customer name first
            const filtered = (result.data || []).filter((lead) => {
                const customerMatch = customerName 
                    ? lead.customer?.name.toLowerCase() === customerName.toLowerCase()
                    : true;

                const queryMatch = 
                    lead.lead_number.toLowerCase().includes(query.toLowerCase()) ||
                    lead.quotation_number?.toLowerCase().includes(query.toLowerCase()) ||
                    lead.customer?.name.toLowerCase().includes(query.toLowerCase()) ||
                    lead.customer?.phone.includes(query) ||
                    lead.customer?.email.toLowerCase().includes(query.toLowerCase());

                return customerMatch && queryMatch;
            });
            setLeadSearchResults(filtered);
        } catch (error) {
            console.error("Error fetching leads:", error);
        } finally {
            setIsSearchingLeads(false);
        }
    };

    const selectLead = (lead) => {
        setFormData((prev) => ({
            ...prev,
            lead_id: lead.id,
            customerName: lead.customer.name,
            companyName: lead.customer.company_name,
            email: lead.customer.email,
            phone: lead.customer.phone,
        }));
        setLeadSearchQuery(lead.lead_number);
        setShowLeadSearch(false);
    };


    const fetchQuotation = async () => {
        setPageLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${baseUrl}/quotations/api/quotations/${id}/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!res.ok) throw new Error("Failed to fetch quotation");
            const data = await res.json();


            const qutations = {
                quotationDate: formatDate(new Date(data.data.created_at)),
                validUntil: formatDate(new Date(data.data.follow_up_date)),
                validityNumber: 30, // derive if backend gives
                validityType: "days",
                followUpDate: formatDate(new Date(data.data.follow_up_date)),
                customerName: data.data.customer?.name || "",
                companyName: data.data.customer?.company_name || "",
                email: data.data.customer?.email || "",
                phone: data.data.customer?.phone || "",
                address: data.data.customer?.primary_address || "",
                gst_number: data.data.customer?.gst_no || "",
                additional_charge_name: data.data.additional_charge_name || "",
                additional_charge_amount: data.data.additional_charge_amount || 0,
                products: data.data.items?.map((item) => ({
                    id: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    selling_price: item.unit_price || "",
                    percentage_discount: item.discount || 0,
                    imageUrl: item.product.image_url || "",
                })) || [],
                subtotal: data.data.subtotal || "0.00",
                discount: data.data.discount || "",
                tax: data.data.tax || "0.00",
                taxRate: data.data.tax_rate || "18",
                discountType: data.data.discount_type || "amount",
                totalAmount: data.data.total || "0.00",
                status: data.data.status,
                additionalNotes: data.data.additional_notes || "",
                createdBy: data.data.created_by || localStorage.getItem("role"),
                digitalSignature: data.data.digital_signature || "",
                specialDiscountEnabled: data.data.discount && data.data.discount !== 0 ? true : false,
                lead_id: data.data.lead ? data.data.lead.id : null,
                is_tax_inclusive: data.data.is_tax_inclusive || false,
            }

            if (!data.data.discount || data.data.discount === 0) {
                qutations.specialDiscountEnabled = false
                qutations.discount = ""
                qutations.discountType = "amount"
            }
            setFormData(qutations);
            setSelectedTerms(data.data.terms || [])
            setLeadSearchQuery(data.data.lead ? data.data.lead.lead_number : "");

        } catch (err) {
            console.error("Error fetching quotation:", err);
        } finally {
            setPageLoading(false);
        }
    };
    // Fetch terms on mount
    useEffect(() => {
        const fetchTerms = async () => {
            try {
                const response = await fetch(`${baseUrl}/quotations/api/terms/`, {
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



            const res = await fetch(
                `${baseUrl}/quotations/api/products/create/`,
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


    const createQuotation = async () => {
        setIsGeneratingPDF(true)

        try {

            const validationErrors = validateForm();
            const hasErrors = Object.values(validationErrors).some((err) => err);

            if (hasErrors) {
                if (validationErrors.terms) {
                    Swal.fire("Validation Error", validationErrors.terms, "error");
                } else {
                    Swal.fire("Validation Error", "Please fix errors in the form.", "error");
                }
                setIsGeneratingPDF(false);
                return;
            }

            if (formData.totalAmount < 0) {
                Swal.fire("Warning!", "Total Amount must be greater than 0", "warning")
                return;
            }

            id ?

                location.pathname.startsWith('/quotations/edit') ?
                    Swal.fire({
                        title: "Updating...",
                        text: "Please wait while we update your Quotation.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    })

                    :
                    Swal.fire({
                        title: "Duplicating...",
                        text: "Please wait while we Duplicate your Quotation.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    })
                : Swal.fire({
                    title: "Creating...",
                    text: "Please wait while we create your Quotation.",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    },
                })
            const token = localStorage.getItem("token");
            const items = await Promise.all(
                formData.products.map(async (p) => {
                    if (!p.id) {
                        const id = await handleSaveProduct(p.name, p.selling_price);
                        return {
                            product: id,
                            name: p.name,
                            quantity: p.quantity,
                            unit_price: p.selling_price ? Number(p.selling_price) : "",
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
                    gst_number: formData.gst_number,
                },
                additional_charge_name: "",
                additional_charge_amount: 0,
                auto_assign: true,
                status: id ? null : formData.status,
                discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
                tax_rate: formData.taxRate,
                discount_type: formData.discountType,
                follow_up_date: formatDateToBackend(formData.validUntil),
                terms: selectedTerms,
                items,
                quotation_id: id ? Number(id) : "",
                send_immediately: true,
                createdBy: localStorage.getItem("user"),
                digitalSignature: formData.digitalSignature,
                additionalNotes: formData.additionalNotes,
                additional_charge_name: formData.additional_charge_name || "",
                additional_charge_amount: formData.additional_charge_amount || 0,
                lead_id: formData.lead_id || null,
                is_tax_inclusive: formData.is_tax_inclusive,
            };



            const response = await fetch(
                `${baseUrl}/quotations/api/quotations/create/`,
                {
                    method: location.pathname.startsWith('/quotations/edit') ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            const result = await response.json();
            console.log(result)

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `Failed to create quotation: ${response.status} - ${errorText}`
                );
            } else {
                window.open(result?.data.pdf_url, '_blank');
            }

            // const result = await response.json();
            Swal.fire(id ? location.pathname.startsWith('/quotations/edit') ? "Updated" : "Duplicated" : "Created!", `The Quotation has been ${id ? location.pathname.startsWith('/quotations/edit') ? "updated" : "duplicated" : "created"}.`, "success")
            setFormData({
                quotationDate: formatDate(new Date()),
                validUntil: formatDate(new Date()),
                validityNumber: 0,
                validityType: "days",
                followUpDate: "",
                customerName: "",
                companyName: "",
                email: "",
                phone: "",
                address: "",
                gst_number: "",
                additional_charge_name: "",
                additional_charge_amount: 0,
                products: [
                    { id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0, imageUrl: "" },
                ],
                subtotal: "0.00",
                discount: "",
                tax: "0.00",
                taxRate: "18",
                discountType: "amount",
                totalAmount: "0.00",
                additionalNotes: "",
                createdBy: localStorage.getItem("role"),
                digitalSignature: "",
                send_immediately: false,
                lead_id: null,
            });

            setSelectedTerms([]); // also reset terms if needed

        } catch (error) {

            Swal.fire("Error!", "Failed creating quotation. Please try again.", "error")

            console.error("❌ Error creating quotation:", error);
        } finally {
            setIsGeneratingPDF(false)
        }
    };
    const createDraft = async () => {
        setIsGeneratingPDF(true)

        try {
            const validationErrors = validateForm();
            const hasErrors = Object.values(validationErrors).some((err) => err);

            if (hasErrors) {
                if (validationErrors.terms) {
                    Swal.fire("Validation Error", validationErrors.terms, "error");
                } else {
                    Swal.fire("Validation Error", "Please fix errors in the form.", "error");
                }
                setIsGeneratingPDF(false);
                return;
            }

            if (formData.totalAmount < 0) {
                Swal.fire("Warning!", "Total Amount must be greater than 0", "warning")
                return;
            }

            id ?

                location.pathname.startsWith('/quotations/edit') ?
                    Swal.fire({
                        title: "Updating...",
                        text: "Please wait while we update your Quotation.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    })

                    :
                    Swal.fire({
                        title: "Duplicating...",
                        text: "Please wait while we Duplicate your Quotation.",
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    })
                : Swal.fire({
                    title: "Creating...",
                    text: "Please wait while we create your Quotation.",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    },
                })

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
                            unit_price: p.selling_price ? Number(p.selling_price) : "",
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
                    gst_number: formData.gst_number || "",
                },
                additional_charge_name: formData.additional_charge_name || "",
                additional_charge_amount: formData.additional_charge_amount || 0,
                auto_assign: true,
                status: formData.status,
                discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
                tax_rate: formData.taxRate,
                discount_type: formData.discountType,
                follow_up_date: formatDateToBackend(formData.validUntil),
                terms: selectedTerms || [],
                items,
                quotation_id: id ? Number(id) : "",
                send_immediately: false,
                createdBy: localStorage.getItem("user"),
                digitalSignature: formData.digitalSignature,
                additionalNotes: formData.additionalNotes,
                lead_id: formData.lead_id || null,
                is_tax_inclusive: formData.is_tax_inclusive,
            };


            const response = await fetch(
                `${baseUrl}/quotations/api/quotations/create/`,
                {
                    method: location.pathname.startsWith('/quotations/edit') ? "PUT" : "POST",
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
            Swal.fire(id ? location.pathname.startsWith('/quotations/edit') ? "Updated" : "Duplicated" : "Created!", `The Quotation has been ${id ? location.pathname.startsWith('/quotations/edit') ? "updated" : "duplicated" : "created"}.`, "success")

            setFormData({
                quotationDate: formatDate(new Date()),
                validUntil: formatDate(new Date()),
                validityNumber: 0,
                validityType: "days",
                followUpDate: "",
                customerName: "",
                companyName: "",
                email: "",
                phone: "",
                address: "",
                gst_number: "",
                additional_charge_name: "",
                additional_charge_amount: 0,
                products: [
                    { id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0, imageUrl: "" },
                ],
                subtotal: "0.00",
                discount: "",
                tax: "0.00",
                taxRate: "18",
                discountType: "amount",
                totalAmount: "0.00",
                additionalNotes: "",
                createdBy: localStorage.getItem("role"),
                digitalSignature: "",
                send_immediately: false,
                is_tax_inclusive: false,
            });

            setSelectedTerms([]); // also reset terms if needed

        } catch (error) {

            Swal.fire("Error!", "Failed creating quotation. Please try again.", "error")

            console.error("❌ Error creating quotation:", error);
        } finally {
            setIsGeneratingPDF(false)
        }
    };
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
            const response = await fetch(`${baseUrl}/quotations/api/products/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json()

            const newProduct = { id: "", name: query.trim(), quantity: 1, selling_price: 0, percentage_discount: 0 }

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

    const resetFormData = () => {
        setFormData({
            quotationDate: formatDate(new Date()),
            validUntil: formatDate(new Date()),
            validityNumber: 0,
            validityType: "days",
            followUpDate: "",
            customerName: "",
            companyName: "",
            email: "",
            phone: "",
            address: "",
            gst_number: "",
            additional_charge_name: "",
            additional_charge_amount: 0,
            products: [
                { id: "", name: "", quantity: 1, selling_price: "", percentage_discount: 0, imageUrl: "" },
            ],
            subtotal: "0.00",
            discount: "",
            tax: "0.00",
            taxRate: "18",
            discountType: "amount",
            totalAmount: "0.00",
            additionalNotes: "",
            createdBy: localStorage.getItem("role"),
            digitalSignature: "",
            send_immediately: false,
            is_tax_inclusive: false,
        });
    };

    const generatePDFAndSend = async () => {
        setIsGeneratingPDF(true)

        try {
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
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : "",
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
        const newProducts = [...formData.products, { id: "", name: "", quantity: 1, selling_price: 0, imageUrl: "" }];
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

        let globalDiscount = 0
        if (formData.specialDiscountEnabled) {
            const discountValue = Number.parseFloat(formData.discount) || 0
            if (formData.discountType === "percentage") {
                globalDiscount = (subtotal * discountValue) / 100
            } else {
                globalDiscount = discountValue
            }
        }
        const additionalCharge = Number.parseFloat(formData.additional_charge_amount) || 0
        const newSubtotal = subtotal - globalDiscount + additionalCharge;
        const taxRate = Number.parseFloat(formData.taxRate) || 0
        
        // Only calculate and add tax if is_tax_inclusive is false
        let tax = 0
        let totalAmount = newSubtotal
        
        if (!formData.is_tax_inclusive) {
            tax = (newSubtotal * taxRate) / 100
            totalAmount = newSubtotal + tax
        } else {
            // If tax is inclusive, set tax to 0 and totalAmount to newSubtotal
            tax = 0;
            totalAmount = newSubtotal;
        }

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
            const response = await fetch(`${baseUrl}/quotations/api/customers/unfiltered/`, {
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
            address: customer.primary_address,
            gst_number: customer.gst_no || "",
        }));
        setCustomerSearchQuery("");
        setShowCustomerSearch(false);
        setShowCompanyDropdown(false); // Add this line
        setCustomerSearchResults([]);
        setCompanySearchResults([]); // Add this line
    };
    const selectCustomerCompany = (customer) => {
        setFormData((prev) => ({
            ...prev,
            companyName: customer.company_name,
        }));
        setCustomerSearchQuery("");
        setShowCustomerSearch(false);
        setShowCompanyDropdown(false); // Add this line
        setCustomerSearchResults([]);
        setCompanySearchResults([]); // Add this line
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

    const handleCompanySearchChange = async (e) => {
        const query = e.target.value;
        updateFormData("companyName", query);

        if (!query.trim()) {
            setShowCompanyDropdown(false);
            setCompanySearchResults([]);
            return;
        }

        setShowCompanyDropdown(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${baseUrl}/quotations/api/customers/unfiltered/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();

            // Filter specifically for the company dropdown
            const filtered = (data.data || []).filter((customer) =>
                (customer.company_name && customer.company_name.toLowerCase().includes(query.toLowerCase())) ||
                (customer.name && customer.name.toLowerCase().includes(query.toLowerCase()))
            );
            setCompanySearchResults(filtered);
        } catch (error) {
            setCompanySearchResults([]);
        }
    };

    // 3. Make sure to update selectCustomer to close the company dropdown


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

    const validateField = (name, value) => {
        let error = "";

        // Email validation
        if (name === "email" || name === "salespersonEmail") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) error = "Email is required";
            else if (!emailRegex.test(value)) error = "Invalid email address";
        }

        // Phone validation
        if (name === "phone" || name === "salespersonPhone") {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!value) error = "Phone number is required";
            else if (!phoneRegex.test(value))
                error = "Phone must be 10 digits and start with 6-9";
        }

        // Name/Company validation
        if (name === "customerName" || name === "companyName") {
            if (!value.trim()) error = "This field is required";
        }

        if (name === "salespersonName") {
            if (!value.trim()) error = "Salesperson name is required";
        }

        return error;
    };

    const validateForm = () => {
        const errors = {};

        errors.customerName = validateField("customerName", formData.customerName);
        errors.companyName = validateField("companyName", formData.companyName);
        // errors.email = validateField("email", formData.email);
        errors.phone = validateField("phone", formData.phone);
        if (selectedTerms.length < 1) {
            errors.terms = "Please select at least one term and condition.";
        }



        setFormErrors(errors);


        // return true if no errors
        return errors;
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
                showCompanyDropdown, setShowCompanyDropdown,
                companySearchResults, setCompanySearchResults,
                handleCompanySearchChange, selectCustomerCompany,
                leadSearchQuery, setLeadSearchQuery,
                leadSearchResults, isSearchingLeads,
                showLeadSearch, setShowLeadSearch,
                searchLeads, selectLead,
                formData, setFormData, resetFormData,
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
                createDraft,
                downloadPDF,
                formErrors,
                id,
                pageLoading,
            }}
        >
            {children}
        </QuotationContext.Provider>
    );
};