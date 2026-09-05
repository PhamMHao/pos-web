import React from "react";
import {
  EnterpriseProject,
  ProjectTask,
  ProjectMaterialTicket,
  Persona,
  Product,
  Customer,
  Employee,
} from "../types/projects.types";
import { ProjectModal } from "./ProjectModal";
import { TaskModal } from "./TaskModal";
import { HierarchicalApprovalModal } from "./HierarchicalApprovalModal";
import { ReworkResubmitModal } from "./ReworkResubmitModal";
import { MaterialBorrowModal } from "./MaterialBorrowModal";
import { MaterialReturnModal } from "./MaterialReturnModal";
import { MaterialToOrderModal } from "./MaterialToOrderModal";

interface ProjectModalsContainerProps {
  // Common data
  projects: EnterpriseProject[];
  tasks: ProjectTask[];
  products: Product[];
  customers: Customer[];
  employees: Employee[];
  currentPersona: Persona;

  // Project Modal
  showProjectModal: boolean;
  editingProject: EnterpriseProject | null;
  onCloseProjectModal: () => void;
  onSuccessProjectModal: () => void;

  // Task Modal
  showTaskModal: boolean;
  editingTask: ProjectTask | null;
  onCloseTaskModal: () => void;
  onSuccessTaskModal: () => void;

  // Approval Modal
  showApprovalModal: boolean;
  targetTaskForApproval: ProjectTask | null;
  approvalLevelToOpen: number;
  onCloseApprovalModal: () => void;
  onSuccessApprovalModal: () => void;

  // Rework Modal
  showReworkModal: boolean;
  targetTaskForRework: ProjectTask | null;
  onCloseReworkModal: () => void;
  onSuccessReworkModal: () => void;

  // Material Borrow Modal
  showBorrowModal: boolean;
  onCloseBorrowModal: () => void;
  onSuccessBorrowModal: () => void;

  // Material Return Modal
  showReturnModal: boolean;
  targetTicketForReturn: ProjectMaterialTicket | null;
  onCloseReturnModal: () => void;
  onSuccessReturnModal: () => void;

  // Material Settle Modal
  showSettleModal: boolean;
  targetTicketForSettle: ProjectMaterialTicket | null;
  onCloseSettleModal: () => void;
  onSuccessSettleModal: (orderCode: string) => void;
}

export const ProjectModalsContainer: React.FC<ProjectModalsContainerProps> = ({
  projects,
  tasks,
  products,
  customers,
  employees,
  currentPersona,

  showProjectModal,
  editingProject,
  onCloseProjectModal,
  onSuccessProjectModal,

  showTaskModal,
  editingTask,
  onCloseTaskModal,
  onSuccessTaskModal,

  showApprovalModal,
  targetTaskForApproval,
  approvalLevelToOpen,
  onCloseApprovalModal,
  onSuccessApprovalModal,

  showReworkModal,
  targetTaskForRework,
  onCloseReworkModal,
  onSuccessReworkModal,

  showBorrowModal,
  onCloseBorrowModal,
  onSuccessBorrowModal,

  showReturnModal,
  targetTicketForReturn,
  onCloseReturnModal,
  onSuccessReturnModal,

  showSettleModal,
  targetTicketForSettle,
  onCloseSettleModal,
  onSuccessSettleModal,
}) => {
  return (
    <>
      {showProjectModal && (
        <ProjectModal
          initialData={editingProject}
          customers={customers}
          employees={employees}
          onClose={onCloseProjectModal}
          onSuccess={onSuccessProjectModal}
        />
      )}

      {showTaskModal && (
        <TaskModal
          initialData={editingTask}
          projects={projects}
          employees={employees}
          products={products}
          onClose={onCloseTaskModal}
          onSuccess={onSuccessTaskModal}
        />
      )}

      {showReworkModal && targetTaskForRework && (
        <ReworkResubmitModal
          task={targetTaskForRework}
          personaName={currentPersona.name}
          onClose={onCloseReworkModal}
          onSuccess={onSuccessReworkModal}
        />
      )}

      {showApprovalModal && targetTaskForApproval && (
        <HierarchicalApprovalModal
          task={targetTaskForApproval}
          initialLevel={approvalLevelToOpen}
          currentPersona={currentPersona}
          onClose={onCloseApprovalModal}
          onSuccess={onSuccessApprovalModal}
        />
      )}

      {showBorrowModal && (
        <MaterialBorrowModal
          projects={projects}
          tasks={tasks}
          products={products}
          employees={employees}
          onClose={onCloseBorrowModal}
          onSuccess={onSuccessBorrowModal}
        />
      )}

      {showReturnModal && targetTicketForReturn && (
        <MaterialReturnModal
          ticket={targetTicketForReturn}
          onClose={onCloseReturnModal}
          onSuccess={onSuccessReturnModal}
        />
      )}

      {showSettleModal && targetTicketForSettle && (
        <MaterialToOrderModal
          ticket={targetTicketForSettle}
          onClose={onCloseSettleModal}
          onSuccess={onSuccessSettleModal}
        />
      )}
    </>
  );
};
