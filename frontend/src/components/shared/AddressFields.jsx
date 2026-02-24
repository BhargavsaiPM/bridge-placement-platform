import React from 'react';

export default function AddressFields({ value, onChange, errors = {} }) {
    const handleChange = (e) => {
        const { name, val } = e.target;
        onChange({ ...value, [name]: val });
    };

    const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm";

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Address Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Door / Flat No. *</label>
                    <input
                        type="text"
                        name="doorNumber"
                        value={value.doorNumber || ''}
                        onChange={(e) => onChange({ ...value, doorNumber: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. 101, A-Block"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Street / Building Name *</label>
                    <input
                        type="text"
                        name="streetName"
                        value={value.streetName || ''}
                        onChange={(e) => onChange({ ...value, streetName: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Tech Park Road"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">City *</label>
                    <input
                        type="text"
                        name="city"
                        value={value.city || ''}
                        onChange={(e) => onChange({ ...value, city: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Hyderabad"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">State *</label>
                    <input
                        type="text"
                        name="state"
                        value={value.state || ''}
                        onChange={(e) => onChange({ ...value, state: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Telangana"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Pincode *</label>
                    <input
                        type="text"
                        name="pincode"
                        value={value.pincode || ''}
                        onChange={(e) => onChange({ ...value, pincode: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. 500081"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Country *</label>
                    <input
                        type="text"
                        name="country"
                        value={value.country || ''}
                        onChange={(e) => onChange({ ...value, country: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. India"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Landmark (Optional)</label>
                    <input
                        type="text"
                        name="landmark"
                        value={value.landmark || ''}
                        onChange={(e) => onChange({ ...value, landmark: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Near Metro Station"
                    />
                </div>
            </div>
        </div>
    );
}
