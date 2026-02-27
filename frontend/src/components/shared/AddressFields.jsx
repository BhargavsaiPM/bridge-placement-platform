import React, { useState, useEffect } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios'; // Or use native fetch

export default function AddressFields({ value, onChange }) {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState({ countries: false, states: false, cities: false, pincode: false });
    const [pincodeError, setPincodeError] = useState('');

    // Fetch Countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            setLoading(l => ({ ...l, countries: true }));
            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
                const data = await res.json();
                if (!data.error) {
                    setCountries(data.data.map(c => c.name));
                }
            } catch (err) {
                console.error('Error fetching countries:', err);
            } finally {
                setLoading(l => ({ ...l, countries: false }));
            }
        };
        fetchCountries();
    }, []);

    // Fetch States when Country changes
    useEffect(() => {
        const fetchStates = async () => {
            if (!value.country) {
                setStates([]);
                return;
            }
            setLoading(l => ({ ...l, states: true }));
            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: value.country })
                });
                const data = await res.json();
                if (!data.error) {
                    setStates(data.data.states.map(s => s.name));
                }
            } catch (err) {
                console.error('Error fetching states:', err);
                setStates([]);
            } finally {
                setLoading(l => ({ ...l, states: false }));
            }
        };
        fetchStates();
    }, [value.country]);

    // Fetch Cities when State changes
    useEffect(() => {
        const fetchCities = async () => {
            if (!value.country || !value.state) {
                setCities([]);
                return;
            }
            setLoading(l => ({ ...l, cities: true }));
            try {
                const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: value.country, state: value.state })
                });
                const data = await res.json();
                if (!data.error) {
                    setCities(data.data);
                }
            } catch (err) {
                console.error('Error fetching cities:', err);
                setCities([]);
            } finally {
                setLoading(l => ({ ...l, cities: false }));
            }
        };
        fetchCities();
    }, [value.country, value.state]);

    // Handle Pincode Auto-fill (India only for Postal API)
    const handlePincodeChange = async (e) => {
        const pin = e.target.value;
        onChange({ ...value, pincode: pin });
        setPincodeError('');

        // Basic check for Indian 6-digit pincode
        if (pin.length === 6 && /^\d+$/.test(pin) && (value.country === 'India' || !value.country)) {
            setLoading(l => ({ ...l, pincode: true }));
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
                const data = await res.json();
                if (data && data[0] && data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0];
                    onChange({
                        ...value,
                        pincode: pin,
                        city: postOffice.Division,
                        district: postOffice.District,
                        state: postOffice.State,
                        country: 'India'
                    });
                } else {
                    setPincodeError('Invalid Pincode');
                }
            } catch (err) {
                console.error('Pincode fetch error:', err);
            } finally {
                setLoading(l => ({ ...l, pincode: false }));
            }
        }
    };

    const inputClass = "w-full pl-4 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm";

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Address Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Country */}
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        Country * {loading.countries && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                    </label>
                    <SearchableDropdown
                        options={countries}
                        value={value.country}
                        onChange={(val) => onChange({ ...value, country: val, state: '', district: '', city: '' })}
                        placeholder="Select Country"
                        disabled={loading.countries || countries.length === 0}
                    />
                </div>

                {/* State */}
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        State * {loading.states && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                    </label>
                    <SearchableDropdown
                        options={states.length > 0 ? states : (value.state ? [value.state] : [])} // Fallback if user typed manually via pincode
                        value={value.state}
                        onChange={(val) => onChange({ ...value, state: val, district: '', city: '' })}
                        placeholder="Select State"
                        disabled={!value.country || (loading.states && states.length === 0)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* District */}
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">District</label>
                    <input
                        type="text"
                        value={value.district || ''}
                        onChange={(e) => onChange({ ...value, district: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Hyderabad"
                    />
                </div>

                {/* City */}
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        City * {loading.cities && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                    </label>
                    {cities.length > 0 ? (
                        <SearchableDropdown
                            options={cities}
                            value={value.city}
                            onChange={(val) => onChange({ ...value, city: val })}
                            placeholder="Select City"
                        />
                    ) : (
                        <input
                            type="text"
                            value={value.city || ''}
                            onChange={(e) => onChange({ ...value, city: e.target.value })}
                            className={inputClass}
                            placeholder="e.g. Hyderabad"
                            required
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pincode */}
                <div className="relative">
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                        Pincode * {loading.pincode && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}
                    </label>
                    <input
                        type="text"
                        value={value.pincode || ''}
                        onChange={handlePincodeChange}
                        className={`${inputClass} ${pincodeError ? 'border-danger/50 focus:ring-danger/50' : ''}`}
                        placeholder="e.g. 500081"
                        required
                    />
                    {pincodeError && <span className="text-[10px] text-danger absolute -bottom-4 left-1">{pincodeError}</span>}
                </div>

                {/* Street */}
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Street / Building Name *</label>
                    <input
                        type="text"
                        value={value.streetName || ''}
                        onChange={(e) => onChange({ ...value, streetName: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Tech Park Road"
                        required
                    />
                </div>
            </div>

            {/* Door Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Door / Flat No. *</label>
                    <input
                        type="text"
                        value={value.doorNumber || ''}
                        onChange={(e) => onChange({ ...value, doorNumber: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. 101, A-Block"
                        required
                    />
                </div>
            </div>
        </div>
    );
}
