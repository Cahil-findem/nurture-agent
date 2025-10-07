import { useState } from 'react';
import FormField from '../components/FormField';
import Dropdown from '../components/Dropdown';
import ChipSelector from '../components/ChipSelector';
import './Recipe1.css';

interface Recipe1Props {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2') => void;
}

const Recipe1: React.FC<Recipe1Props> = ({ onNavigate }) => {
  const [businessObjective, setBusinessObjective] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    'Software Engineer',
    'Sales Associates',
    'Customers',
    'Technical Support Team'
  ]);
  const [successMetrics, setSuccessMetrics] = useState([
    'Increase candidate engagement by 20%',
    'Grow talent pool by 500'
  ]);
  const [contentSources, setContentSources] = useState([
    'Company Website',
    'Product Help Documentation',
    'Public News'
  ]);

  const businessObjectiveOptions = [
    { value: 'build_future_ready_pipeline', label: 'Build future-ready pipeline' },
    { value: 'fill_critical_roles_faster', label: 'Fill critical roles faster' },
    { value: 'increase_candidate_engagement', label: 'Increase candidate engagement' },
    { value: 're_engage_silver_medalists', label: 'Re-engage silver medalists' },
    { value: 'strengthen_employer_brand', label: 'Strengthen employer brand' },
    { value: 'reduce_time_to_hire', label: 'Reduce time-to-hire' },
    { value: 'improve_candidate_experience', label: 'Improve candidate experience' }
  ];

  const teamMemberOptions = [
    { value: 'software_engineer', label: 'Software Engineer' },
    { value: 'sales_associates', label: 'Sales Associates' },
    { value: 'customers', label: 'Customers' },
    { value: 'technical_support_team', label: 'Technical Support Team' },
    { value: 'hr_team', label: 'HR Team' },
    { value: 'marketing_team', label: 'Marketing Team' },
    { value: 'product_manager', label: 'Product Manager' },
    { value: 'data_analyst', label: 'Data Analyst' },
    { value: 'recruiting_team', label: 'Recruiting Team' },
    { value: 'hiring_managers', label: 'Hiring Managers' }
  ];

  const successMetricOptions = [
    { value: 'increase_candidate_engagement_20', label: 'Increase candidate engagement by 20%' },
    { value: 'grow_talent_pool_500', label: 'Grow talent pool by 500' },
    { value: 'reduce_time_to_hire_30', label: 'Reduce time-to-hire by 30%' },
    { value: 'improve_candidate_satisfaction_25', label: 'Improve candidate satisfaction by 25%' },
    { value: 'increase_offer_acceptance_15', label: 'Increase offer acceptance rate by 15%' },
    { value: 'reduce_cost_per_hire_20', label: 'Reduce cost per hire by 20%' },
    { value: 'improve_quality_of_hire', label: 'Improve quality of hire score' },
    { value: 'increase_diversity_hires_30', label: 'Increase diversity hires by 30%' },
    { value: 'boost_employer_brand_score', label: 'Boost employer brand score' },
    { value: 'expand_passive_candidate_pool', label: 'Expand passive candidate pool by 40%' }
  ];

  const contentSourceOptions = [
    { value: 'company_website', label: 'Company Website' },
    { value: 'product_help_docs', label: 'Product Help Documentation' },
    { value: 'public_news', label: 'Public News' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'blog_posts', label: 'Blog Posts' },
    { value: 'press_releases', label: 'Press Releases' },
    { value: 'case_studies', label: 'Case Studies' },
    { value: 'white_papers', label: 'White Papers' }
  ];


  const handleSave = () => {
    const recipeData = {
      businessObjective,
      teamMembers,
      successMetrics,
      contentSources,
      timestamp: Date.now()
    };

    console.log('Recipe 1 data:', recipeData);
    // Navigate to RecipeLoader page
    onNavigate?.('recipe-loader');
  };

  const handleRestartDemo = () => {
    // Navigate back to DemoSetup page
    onNavigate?.('demo-setup');
  };

  return (
    <div className="recipe1">
      <div className="recipe1-container">
        <div className="recipe1-content">
          {/* Header Section */}
          <div className="recipe1-header">
            <h1 className="recipe1-title">Set your nurture goals</h1>
            <p className="recipe1-subtitle">
              Create and manage your business process recipe
            </p>
          </div>

          {/* Form Section */}
          <div className="recipe1-form">
            {/* Business Objective Field */}
            <FormField
              label="Business Objective"
              description="Select the primary business objective for this recipe"
              required
            >
              <Dropdown
                options={businessObjectiveOptions}
                placeholder="Select business objective"
                value={businessObjective}
                onChange={setBusinessObjective}
              />
            </FormField>

            {/* Team Members Field */}
            <FormField
              label="Team Members"
              description="People or roles involved in this process"
            >
              <ChipSelector
                selectedValues={teamMembers}
                onValuesChange={setTeamMembers}
                options={teamMemberOptions}
                placeholder="Add team member..."
              />
            </FormField>

            {/* Success Metrics Field */}
            <FormField
              label="Success Metrics"
              description="How will you measure success? Pick the KPIs that matter most."
            >
              <ChipSelector
                selectedValues={successMetrics}
                onValuesChange={setSuccessMetrics}
                options={successMetricOptions}
                placeholder="Add success metric..."
              />
            </FormField>

            {/* Content Sources Field */}
            <FormField
              label="Content Sources"
              description="Where should we pull content from?"
            >
              <ChipSelector
                selectedValues={contentSources}
                onValuesChange={setContentSources}
                options={contentSourceOptions}
                placeholder="Add content source..."
              />
            </FormField>

          </div>

          {/* Actions Section */}
          <div className="recipe1-actions">
            <button
              className="save-recipe-button"
              onClick={handleSave}
            >
              <span className="save-recipe-button-text">Save Recipe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restart Demo Button */}
      <button
        className="restart-demo-button"
        onClick={handleRestartDemo}
        title="Restart Demo"
      >
        <span className="material-icons-round">refresh</span>
        <span className="restart-text">Restart</span>
      </button>
    </div>
  );
};

export default Recipe1;