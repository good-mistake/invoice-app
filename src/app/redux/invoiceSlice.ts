import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface Item {
  name?: string;
  quantity: number;
  price: number;
  total: number;
  _id: number;
}

interface Address {
  street?: string;
  city?: string;
  postCode?: string;
  country?: string;
}

interface Invoice {
  userId?: string;
  _id: number;
  id: string;
  createdAt?: string;
  paymentDue?: string | Date;
  description?: string;
  paymentTerms?: number;
  clientName?: string;
  clientEmail?: string;
  status?: string;
  senderAddress?: Address;
  clientAddress?: Address;
  items: Item[];
  total?: number;
  isPublic?: boolean;
}
interface InvoiceState {
  list: Invoice[];
  filteredStatus: null;
}

const initialState: InvoiceState = {
  list: [],
  filteredStatus: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    setInvoice: (state, action: PayloadAction<Invoice[]>) => {
      state.list = action.payload;
    },
    updateInvoiceInList: (state, action) => {
      state.list = state.list.map((inv) =>
        inv.id === action.payload.id ? action.payload : inv
      );
    },
    removeInvoice: (state, action) => {
      state.list = state.list.filter((e) => e.id !== action.payload.id);
    },
    addInvoiceToList: (state, action: PayloadAction<Invoice>) => {
      state.list.push(action.payload);
    },
    setFilteredStatus: (state, action) => {
      state.filteredStatus = action.payload;
    },
  },
});

export const {
  removeInvoice,
  setInvoice,
  updateInvoiceInList,
  addInvoiceToList,
  setFilteredStatus,
} = invoiceSlice.actions;

export default invoiceSlice.reducer;
