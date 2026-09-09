import React from 'react';
import { Hospital } from '@medimatch/shared';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Building2, MapPin, Bed, Activity } from 'lucide-react';

interface HospitalCardProps {
  hospital: Hospital;
  onBookVisit: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onBookVisit }) => {
  return (
    <Card hover className="group flex flex-col justify-between rounded-2xl border border-sky-400/30 shadow-lg card-lift overflow-hidden glass-card">
      <div>
        <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
          <img
            src={hospital.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/90 via-[#061224]/30 to-transparent pointer-events-none" />

          <div className="absolute top-3 right-3">
            <span className="glass-dark text-[10px] font-bold px-3 py-1 rounded-full text-cyan-300 backdrop-blur-md border border-sky-400/35 shadow-md tracking-wide">
              {hospital.accreditation}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="bg-[#071326]/85 text-[10px] font-bold px-3 py-1 rounded-full text-cyan-300 backdrop-blur-md border border-sky-400/35 shadow-md flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{hospital.city}</span>
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {hospital.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px] leading-relaxed">
            {hospital.address}
          </p>

          <div className="flex items-center gap-3 mt-4 pt-3.5 border-t border-sky-400/20 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill font-semibold text-slate-300 border border-sky-400/25">
              <Bed className="w-3.5 h-3.5 text-cyan-400" />
              <span>{hospital.beds} Beds</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 font-semibold backdrop-blur-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{hospital.icuBeds} ICU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBookVisit(hospital)}
          className="w-full border-sky-400/35 bg-sky-500/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white text-cyan-300 font-bold py-2 shadow-xs transition-all duration-300"
        >
          Book Hospital Visit
        </Button>
      </div>
    </Card>
  );
};

