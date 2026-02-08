import { CheckCircle, Circle, Clock, Trophy } from 'lucide-react';
import React from 'react';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  progress?: number; // 0-100
}

interface ProgressIndicatorProps {
  steps?: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  showPercentage?: boolean;
  showLabels?: boolean;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps = [],
  orientation = 'horizontal',
  showPercentage = true,
  showLabels = true,
  className = ''
}) => {
  // stepsが空の場合は何も表示しない
  if (!steps.length) {
    return null;
  }

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const _getStepColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showPercentage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                学習進捗
              </span>
              <span className="text-sm text-gray-500">
                {completedSteps}/{totalSteps} 完了
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-gray-500">
                {Math.round(overallProgress)}%
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {steps.map((step, _index) => (
            <div
              key={step.id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${step.status === 'current'
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStepIcon(step)}
              </div>

              <div className="flex-1 min-w-0">
                {showLabels && (
                  <>
                    <h3 className={`text-sm font-medium ${step.status === 'completed'
                      ? 'text-green-800 dark:text-green-300'
                      : step.status === 'current'
                        ? 'text-blue-800 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400'
                      }`}>
                      {step.title}
                    </h3>

                    {step.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {step.description}
                      </p>
                    )}
                  </>
                )}

                {step.progress !== undefined && step.status === 'current' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {step.progress}% 完了
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {completedSteps === totalSteps && (
          <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">
              すべてのステップが完了しました！
            </span>
          </div>
        )}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className={className}>
      {showPercentage && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              学習進捗
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${step.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : step.status === 'current'
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : (
                <span className={`text-xs font-medium ${step.status === 'current' ? 'text-white' : 'text-gray-500'
                  }`}>
                  {index + 1}
                </span>
              )}
            </div>

            {showLabels && (
              <div className="ml-3 min-w-0">
                <p className={`text-sm font-medium ${step.status === 'completed'
                  ? 'text-green-600 dark:text-green-400'
                  : step.status === 'current'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500'
                  }`}>
                  {step.title}
                </p>
              </div>
            )}

            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${steps[index + 1].status === 'completed' || step.status === 'completed'
                ? 'bg-green-300'
                : 'bg-gray-300 dark:bg-gray-600'
                }`} />
            )}
          </div>
        ))}
      </div>

      {completedSteps === totalSteps && (
        <div className="mt-4 flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Trophy className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-sm font-medium text-green-800 dark:text-green-300">
            おめでとうございます！全ステップ完了
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
