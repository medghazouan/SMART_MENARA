import { useState } from 'react';
import { format } from 'date-fns';

export default function ActionForm({ 
  onSubmit = null, 
  isLoading = false,
  defaultValues = null,
  onCancel = null,
}) {
  const [formData, setFormData] = useState(defaultValues || {
    description: '',
    type: 'Corrective',
    date_action: format(new Date(), 'yyyy-MM-dd'),
    temps_estime: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description?.trim()) newErrors.description = 'Description requise';
    if (!formData.date_action) newErrors.date_action = 'Date requise';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type d'action</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="Corrective">Corrective</option>
          <option value="Preventive">Préventive</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez l'action..."
          rows="4"
          className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'action</label>
          <input
            type="date"
            name="date_action"
            value={formData.date_action}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
              errors.date_action ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.date_action && <p className="text-xs text-red-600 mt-1">{errors.date_action}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temps estimé (heures)</label>
          <input
            type="number"
            name="temps_estime"
            value={formData.temps_estime}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
