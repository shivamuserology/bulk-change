import React from 'react';
import { WizardProvider, useWizard, ENTRY_MODES } from './context/WizardContext';
import ProgressHeader from './components/ProgressHeader';
import DemoControlPanel from './components/DemoControlPanel';
import ActionLogPanel from './components/ActionLogPanel';
import Step1_SelectEmployees from './components/wizard/Step1_SelectEmployees';
import Step2_ChooseAttributes from './components/wizard/Step2_ChooseAttributes';
import Step3_SpecifyValues from './components/wizard/Step3_SpecifyValues';
import Step4_Validation from './components/wizard/Step4_Validation';
import Step5_ReviewConfirm from './components/wizard/Step5_ReviewConfirm';
import Step6_Execute from './components/wizard/Step6_Execute';
import Step7_PostExecution from './components/wizard/Step7_PostExecution';
import CSVUploadModal from './components/CSVUploadModal';
import './styles/rippling-tokens.css';
import './App.css';

import MainLayout from './components/layout/MainLayout';

function WizardContent() {
  const { currentStep, entryMode, importCSVComplete, actionLogs } = useWizard();
  const [showCSVComplete, setShowCSVComplete] = React.useState(false);
  const [isLogOpen, setIsLogOpen] = React.useState(false);

  // Show CSV complete modal if entry mode is CSV_COMPLETE
  React.useEffect(() => {
    if (entryMode === ENTRY_MODES.CSV_COMPLETE) {
      setShowCSVComplete(true);
    }
  }, [entryMode]);

  const handleCSVComplete = (data) => {
    importCSVComplete(data);
    setShowCSVComplete(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_SelectEmployees />;
      case 2: return <Step2_ChooseAttributes />;
      case 3: return <Step3_SpecifyValues />;
      case 4: return <Step4_Validation />;
      case 5: return <Step5_ReviewConfirm />;
      case 6: return <Step6_Execute />;
      case 7: return <Step7_PostExecution />;
      default: return <Step1_SelectEmployees />;
    }
  };

  return (
    <MainLayout>
      <div className="wizard-content-wrapper">
        {currentStep > 1 && <ProgressHeader />}
        <div className="step-content-area">
          {renderStep()}
        </div>
      </div>
      <DemoControlPanel />

      {/* Action Log Toggle Button */}
      <button
        className={`floating-log-btn ${actionLogs.length > 0 ? 'has-logs' : ''}`}
        onClick={() => setIsLogOpen(true)}
        title="View Action Log"
      >
        <span className="btn-icon">📋</span>
        {actionLogs.length > 0 && <span className="log-badge-count">{actionLogs.length}</span>}
      </button>

      <ActionLogPanel isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />

      {showCSVComplete && (
        <CSVUploadModal
          type="complete"
          onClose={() => setShowCSVComplete(false)}
          onUpload={handleCSVComplete}
        />
      )}
    </MainLayout>
  );
}

function App() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}

export default App;
