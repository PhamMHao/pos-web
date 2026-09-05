import React, { useState, useEffect, useMemo } from 'react';
import { CustomerContractHeader } from './CustomerContractHeader';
import { CustomerContractFilterBar } from './CustomerContractFilterBar';
import { CustomerContractTable } from './CustomerContractTable';
import { CustomerContractDetailDrawer } from './CustomerContractDetailDrawer';
import { CreateCustomerContractModal } from './CreateCustomerContractModal';
import { CustomerContractPrintModal } from './CustomerContractPrintModal';
import { CustomerContractSignModal } from './CustomerContractSignModal';
import { CustomerContractHandoverModal } from './CustomerContractHandoverModal';
import { CustomerContractLiquidationModal } from './CustomerContractLiquidationModal';
import { contractsApi } from '../../../features/contracts/api/contractsApi';
import {
  CustomerContract,
  CreateContractPayload,
  SignContractPayload,
  CreateHandoverPayload,
  CreateLiquidationPayload,
} from '../contracts.types';

export interface CustomerContractsViewProps {
  initialQuoteId?: string | null;
}

export const CustomerContractsView: React.FC<CustomerContractsViewProps> = ({
  initialQuoteId,
}) => {
  const [contracts, setContracts] = useState<CustomerContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalLevelFilter, setApprovalLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(Boolean(initialQuoteId));
  const [selectedDetailContract, setSelectedDetailContract] = useState<CustomerContract | null>(null);
  const [selectedPrintContract, setSelectedPrintContract] = useState<CustomerContract | null>(null);
  const [selectedSignContract, setSelectedSignContract] = useState<CustomerContract | null>(null);
  const [selectedHandoverContract, setSelectedHandoverContract] = useState<CustomerContract | null>(null);
  const [selectedLiquidationContract, setSelectedLiquidationContract] = useState<CustomerContract | null>(null);

  // Fetch contracts from backend SQL Server
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await contractsApi.getContracts();
      if (res && res.data) {
        setContracts(res.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách hợp đồng kinh tế:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesNumber = c.contractNumber?.toLowerCase().includes(query);
        const matchesTitle = c.title?.toLowerCase().includes(query);
        const matchesCustomer = c.customerName?.toLowerCase().includes(query);
        const matchesTaxCode = c.customerTaxCode?.toLowerCase().includes(query);
        const matchesProject = c.projectCode?.toLowerCase().includes(query);
        const matchesQuote = c.quoteCode?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesTitle && !matchesCustomer && !matchesTaxCode && !matchesProject && !matchesQuote) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }

      // Level filter
      if (approvalLevelFilter !== 'all' && c.approvalLevel.toString() !== approvalLevelFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && c.contractType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [contracts, searchTerm, statusFilter, approvalLevelFilter, typeFilter]);

  // Handlers
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setApprovalLevelFilter('all');
    setTypeFilter('all');
  };

  const handleCreateContract = async (payload: CreateContractPayload) => {
    await contractsApi.createContract(payload);
    await fetchContracts();
  };

  const handleCreateFromQuote = async (quoteId: string, notes?: string) => {
    await contractsApi.createFromQuote({ quoteId, notes });
    await fetchContracts();
  };

  const handleSignContract = async (payload: SignContractPayload) => {
    if (!selectedSignContract) return;
    const updated = await contractsApi.signContract(selectedSignContract.id, payload);
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedDetailContract && selectedDetailContract.id === updated.id) {
      setSelectedDetailContract(updated);
    }
  };

  const handleCreateHandover = async (payload: CreateHandoverPayload) => {
    if (!selectedHandoverContract) return;
    const updated = await contractsApi.createHandover(selectedHandoverContract.id, payload);
    setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    if (selectedDetailContract && selectedDetailContract.id === updated.id) {
      setSelectedDetailContract(updated);
    }
  };

  const handleCreateLiquidation = async (payload: CreateLiquidationPayload) => {
    if (!selectedLiquidationContract) return;
    const res = await contractsApi.createLiquidation(selectedLiquidationContract.id, payload);
    if (res.data?.contract) {
      const updated = res.data.contract;
      setContracts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedDetailContract && selectedDetailContract.id === updated.id) {
        setSelectedDetailContract(updated);
      }
    }
    await fetchContracts();
  };

  const handleDeleteContract = async (contract: CustomerContract) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hợp đồng [${contract.contractNumber}]?`)) {
      return;
    }
    try {
      await contractsApi.deleteContract(contract.id);
      setContracts((prev) => prev.filter((c) => c.id !== contract.id));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Không thể xóa hợp đồng này!');
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'Số Hợp Đồng',
      'Tiêu Đề',
      'Loại HĐ',
      'Khách Hàng',
      'Mã Số Thuế',
      'Tổng Tiền Trước Thuế',
      'Thuế VAT',
      'Tổng Giá Trị',
      'Đã Thanh Toán',
      'Cấp Duyệt',
      'Trạng Thái',
      'Ngày Ký',
      'Hóa Đơn VAT',
    ];

    const rows = filteredContracts.map((c) => [
      c.contractNumber,
      `"${c.title.replace(/"/g, '""')}"`,
      c.contractType,
      `"${c.customerName.replace(/"/g, '""')}"`,
      c.customerTaxCode || '',
      c.totalAmount,
      c.taxAmount,
      c.finalTotal,
      c.paidAmount,
      `Cấp ${c.approvalLevel}`,
      c.status,
      c.signedDate ? new Date(c.signedDate).toLocaleDateString('vi-VN') : '',
      c.einvoiceCode || '',
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `HopDongKinhTe_GP_ERP_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 p-2 sm:p-4">
      {/* 1. Header & KPI Cards */}
      <CustomerContractHeader
        contracts={contracts}
        loading={loading}
        onRefresh={fetchContracts}
        onCreateNew={() => setIsCreateModalOpen(true)}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Filter Bar */}
      <CustomerContractFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        approvalLevelFilter={approvalLevelFilter}
        onApprovalLevelFilterChange={setApprovalLevelFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredContracts.length}
      />

      {/* 3. Data Table */}
      <CustomerContractTable
        contracts={filteredContracts}
        loading={loading}
        onViewDetail={(c) => setSelectedDetailContract(c)}
        onPrintContract={(c) => setSelectedPrintContract(c)}
        onSignContract={(c) => setSelectedSignContract(c)}
        onCreateHandover={(c) => setSelectedHandoverContract(c)}
        onCreateLiquidation={(c) => setSelectedLiquidationContract(c)}
        onDeleteContract={handleDeleteContract}
      />

      {/* 4. 360° Detail Drawer */}
      {selectedDetailContract && (
        <CustomerContractDetailDrawer
          contract={selectedDetailContract}
          onClose={() => setSelectedDetailContract(null)}
          onPrint={(c) => setSelectedPrintContract(c)}
          onSign={(c) => setSelectedSignContract(c)}
          onCreateHandover={(c) => setSelectedHandoverContract(c)}
          onCreateLiquidation={(c) => setSelectedLiquidationContract(c)}
        />
      )}

      {/* 5. Create Contract Modal */}
      <CreateCustomerContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContract}
        onSubmitFromQuote={handleCreateFromQuote}
        initialQuoteId={initialQuoteId}
      />

      {/* 6. Legal Print Modal */}
      {selectedPrintContract && (
        <CustomerContractPrintModal
          contract={selectedPrintContract}
          onClose={() => setSelectedPrintContract(null)}
        />
      )}

      {/* 7. Sign Contract Modal */}
      {selectedSignContract && (
        <CustomerContractSignModal
          contract={selectedSignContract}
          onClose={() => setSelectedSignContract(null)}
          onSignSuccess={handleSignContract}
        />
      )}

      {/* 8. Handover Note Modal */}
      {selectedHandoverContract && (
        <CustomerContractHandoverModal
          contract={selectedHandoverContract}
          onClose={() => setSelectedHandoverContract(null)}
          onSubmit={handleCreateHandover}
        />
      )}

      {/* 9. Liquidation & E-Invoice Modal */}
      {selectedLiquidationContract && (
        <CustomerContractLiquidationModal
          contract={selectedLiquidationContract}
          onClose={() => setSelectedLiquidationContract(null)}
          onSubmit={handleCreateLiquidation}
        />
      )}
    </div>
  );
};
