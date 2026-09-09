import { Hospital, Doctor, Patient, Assessment, Inquiry } from '@medimatch/shared';
import bcrypt from 'bcryptjs';

export interface SeedHospitalInput {
  name: string;
  city: string;
  accreditation: string;
  address: string;
  beds: number;
  icuBeds: number;
  imageUrl: string;
}

export interface SeedDoctorInput {
  name: string;
  specialty: string;
  credentials: string;
  yearsExp: number;
  fee: number;
  photoUrl: string;
}

const HOSPITAL_PHOTOS = [
  'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80'
];

export const RAW_100_HOSPITALS: SeedHospitalInput[] = [
  // Mumbai (1-15)
  { name: 'Kokilaben Dhirubhai Ambani Hospital', city: 'Mumbai', accreditation: 'NABH & JCI', address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West', beds: 750, icuBeds: 180, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Tata Memorial Centre (Advanced Cancer Care)', city: 'Mumbai', accreditation: 'NABH Accredited', address: 'Dr. E Borges Road, Parel', beds: 600, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Lilavati Hospital & Research Centre', city: 'Mumbai', accreditation: 'NABH Accredited', address: 'A-791, Bandra Reclamation, Bandra West', beds: 314, icuBeds: 70, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Hinduja Hospital & Medical Research Centre', city: 'Mumbai', accreditation: 'NABH & JCI', address: 'Veer Savarkar Marg, Mahim West', beds: 400, icuBeds: 85, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Fortis Hospital Mulund', city: 'Mumbai', accreditation: 'JCI Accredited', address: 'Mulund Goregaon Link Rd, Industrial Area, Bhandup West', beds: 350, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Nanavati Max Super Speciality Hospital', city: 'Mumbai', accreditation: 'NABH Accredited', address: 'Swami Vivekananda Rd, Besant Nagar, Vile Parle West', beds: 352, icuBeds: 75, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Sir H. N. Reliance Foundation Hospital', city: 'Mumbai', accreditation: 'NABH & JCI', address: 'Raja Ram Mohan Roy Rd, Prarthana Samaj, Girgaon', beds: 345, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Hiranandani Hospital Powai', city: 'Mumbai', accreditation: 'NABH Accredited', address: 'Hillside Avenue, Hiranandani Gardens, Powai', beds: 240, icuBeds: 50, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Bombay Hospital & Medical Research Centre', city: 'Mumbai', accreditation: 'NABH Accredited', address: '12 Marine Lines, New Marine Lines', beds: 830, icuBeds: 140, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Jaslok Hospital & Research Centre', city: 'Mumbai', accreditation: 'NABH Accredited', address: '15 Dr. G. Deshmukh Marg, Pedder Road', beds: 364, icuBeds: 75, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Apollo Hospitals Navi Mumbai', city: 'Mumbai', accreditation: 'JCI Accredited', address: 'Plot # 13, Off Uran Road, Parsik Hill Rd, CBD Belapur', beds: 500, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Global Hospitals Parel', city: 'Mumbai', accreditation: 'NABH Accredited', address: '35 Dr. E Borges Road, Hospital Avenue, Parel', beds: 450, icuBeds: 95, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Wockhardt Hospital Mumbai Central', city: 'Mumbai', accreditation: 'NABH & JCI', address: '1877 Doctor Anandrao Nair Marg, Mumbai Central', beds: 350, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'SL Raheja Hospital (Fortis Associate)', city: 'Mumbai', accreditation: 'NABH Accredited', address: 'Raheja Rugnalaya Marg, Mahim West', beds: 170, icuBeds: 40, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Breach Candy Hospital Trust', city: 'Mumbai', accreditation: 'NABH Accredited', address: '60 A Bhulabhai Desai Road', beds: 212, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[6] },

  // Delhi NCR (16-30)
  { name: 'Medanta - The Medicity', city: 'Delhi NCR', accreditation: 'NABH & JCI', address: 'CH Bakhtawar Singh Rd, Sector 38, Gurugram', beds: 1250, icuBeds: 350, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Max Super Speciality Hospital Saket', city: 'Delhi NCR', accreditation: 'JCI Accredited', address: '1 2, Press Enclave Marg, Saket Institutional Area', beds: 530, icuBeds: 145, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Indraprastha Apollo Hospitals', city: 'Delhi NCR', accreditation: 'JCI Accredited', address: 'Delhi-Mathura Road, Sarita Vihar', beds: 710, icuBeds: 160, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Fortis Memorial Research Institute (FMRI)', city: 'Delhi NCR', accreditation: 'NABH & JCI', address: 'Sector 44, Opp. HUDA City Centre Metro, Gurugram', beds: 1000, icuBeds: 260, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Sir Ganga Ram Hospital', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'Sir Ganga Ram Hospital Marg, Old Rajinder Nagar', beds: 675, icuBeds: 130, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Artemis Hospital', city: 'Delhi NCR', accreditation: 'JCI Accredited', address: 'Sector 51, Gurugram', beds: 400, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'BLK-Max Super Speciality Hospital', city: 'Delhi NCR', accreditation: 'NABH & JCI', address: 'Pusa Rd, Radha Soami Satsang, Rajendra Place', beds: 650, icuBeds: 125, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Fortis Escorts Heart Institute', city: 'Delhi NCR', accreditation: 'NABH & JCI', address: 'Okhla Road, Sukhdev Vihar Metro Station', beds: 310, icuBeds: 105, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Jaypee Hospital Noida', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'Sector 128, Wish Town, Noida', beds: 525, icuBeds: 110, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Manipal Hospital Dwarka', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'Sector 6 Dwarka, Dwarka, New Delhi', beds: 380, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Max Super Speciality Hospital Patparganj', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: '108 A, I.P.Extension, Patparganj', beds: 400, icuBeds: 85, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Marengo Asia Hospital Gurugram', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'Golf Course Extension Rd, Sector 56, Gurugram', beds: 250, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Yashoda Super Speciality Hospitals Kaushambi', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'H-1, Kaushambi, Ghaziabad', beds: 350, icuBeds: 70, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Amrita Hospital Faridabad', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'Sector 88, Faridabad', beds: 2600, icuBeds: 500, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Fortis Hospital Shalimar Bagh', city: 'Delhi NCR', accreditation: 'NABH Accredited', address: 'AA Block, Poorbi Shalimar Bag, Shalimar Bagh', beds: 262, icuBeds: 65, imageUrl: HOSPITAL_PHOTOS[5] },

  // Bangalore (31-45)
  { name: 'Manipal Hospital Old Airport Road', city: 'Bangalore', accreditation: 'NABH & JCI', address: '98, HAL Old Airport Rd, Kodihalli', beds: 600, icuBeds: 140, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Narayana Institute of Cardiac Sciences', city: 'Bangalore', accreditation: 'JCI Accredited', address: '258/A, Bommasandra Industrial Area, Anekal Taluk', beds: 800, icuBeds: 210, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Apollo Hospitals Bannerghatta Road', city: 'Bangalore', accreditation: 'JCI Accredited', address: '154/11, Opp IIM-B, Bannerghatta Road', beds: 250, icuBeds: 65, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Fortis Hospital Bannerghatta Road', city: 'Bangalore', accreditation: 'JCI Accredited', address: '154/9, Opposite IIM-B, Bannerghatta Road', beds: 276, icuBeds: 70, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Aster CMI Hospital Hebbal', city: 'Bangalore', accreditation: 'NABH & JCI', address: 'No. 43/2, New Airport Road, NH 44, Sahakar Nagar', beds: 500, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Mazumdar Shaw Cancer Centre', city: 'Bangalore', accreditation: 'NABH & JCI', address: 'Health City, Bommasandra, Anekal', beds: 1400, icuBeds: 280, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'BGS Gleneagles Global Hospitals Kengeri', city: 'Bangalore', accreditation: 'NABH Accredited', address: '67, Uttarahalli Road, Kengeri', beds: 450, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Columbia Asia Referral Hospital Yeshwanthpur', city: 'Bangalore', accreditation: 'NABH & JCI', address: '26/4, Brigade Gateway, Beside Metro, Malleshwaram', beds: 200, icuBeds: 50, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Sakra World Hospital', city: 'Bangalore', accreditation: 'NABH Accredited', address: 'SY NO 52/2 & 52/3, Devarabeesanahalli Flyover, Bellandur', beds: 350, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'HCG Cancer Centre Kalinga Rao Road', city: 'Bangalore', accreditation: 'NABH Accredited', address: '8, P. Kalinga Rao Road, Sampangi Rama Nagar', beds: 300, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'St. John\'s Medical College Hospital', city: 'Bangalore', accreditation: 'NABH Accredited', address: 'Sarjapur Main Road, John Nagar, Koramangala', beds: 1350, icuBeds: 180, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Sparsh Hospital Yeswanthpur', city: 'Bangalore', accreditation: 'NABH Accredited', address: '4/1, Tumkur Rd, Yeshwanthpur Industrial Suburb', beds: 250, icuBeds: 55, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Vydehi Institute of Medical Sciences', city: 'Bangalore', accreditation: 'NABH Accredited', address: '82, Nallurahalli Main Rd, Whitefield', beds: 1000, icuBeds: 150, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Cloudnine Hospital Old Airport Road', city: 'Bangalore', accreditation: 'NABH Accredited', address: '115, HAL Old Airport Rd, Murgesh Pallya', beds: 120, icuBeds: 30, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Manipal Hospital Whitefield', city: 'Bangalore', accreditation: 'NABH Accredited', address: '#143, 212-215, EPIP Zone, Whitefield', beds: 280, icuBeds: 65, imageUrl: HOSPITAL_PHOTOS[4] },

  // Hyderabad (46-58)
  { name: 'Apollo Health City Jubilee Hills', city: 'Hyderabad', accreditation: 'JCI Accredited', address: 'Road No 72, Opp. Bharatiya Vidya Bhavan School, Jubilee Hills', beds: 550, icuBeds: 135, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Yashoda Hospitals Somajiguda', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Alexander Rd, Raj Bhavan Quarters, Somajiguda', beds: 500, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'KIMS Hospitals Secunderabad', city: 'Hyderabad', accreditation: 'NABH Accredited', address: '1-8-31/1, Minister Rd, Krishna Nagar Colony, Begumpet', beds: 1000, icuBeds: 220, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Continental Hospitals Financial District', city: 'Hyderabad', accreditation: 'JCI Accredited', address: 'Plot No. 3, Rd Number 2, IT & Financial Dist, Nanakramguda', beds: 750, icuBeds: 150, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Care Hospitals Banjara Hills', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Road No. 1, Prem Nagar, Banjara Hills', beds: 435, icuBeds: 95, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'AIG Hospitals Gachibowli', city: 'Hyderabad', accreditation: 'JCI Accredited', address: '1-66/AIG/2 to 5, Mindspace Rd, Gachibowli', beds: 800, icuBeds: 180, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Basavatarakam Indo-American Cancer Hospital', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Road No. 10, Banjara Hills', beds: 500, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Sunshine Hospitals Gachibowli', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Near Pullela Gopichand Badminton Academy, Gachibowli', beds: 200, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Star Hospitals Nanakramguda', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Financial District, Nanakramguda', beds: 350, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Citizens Specialty Hospital', city: 'Hyderabad', accreditation: 'NABH & JCI', address: '1-100/1/CCH, Nallagandla, Serilingampally', beds: 300, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Yashoda Hospitals Hitec City', city: 'Hyderabad', accreditation: 'NABH & JCI', address: 'Hitec City Main Rd, Jayabheri Enclave, Gachibowli', beds: 900, icuBeds: 210, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Pace Hospitals Madhapur', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Metro Pillar C1775, Hitech City Rd, Madhapur', beds: 150, icuBeds: 35, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Medicover Hospitals Madhapur', city: 'Hyderabad', accreditation: 'NABH Accredited', address: 'Behind Cyber Towers, In the Lane of IBIS Hotel, HITEC City', beds: 400, icuBeds: 85, imageUrl: HOSPITAL_PHOTOS[1] },

  // Chennai (59-71)
  { name: 'Apollo Hospitals Greams Road', city: 'Chennai', accreditation: 'JCI Accredited', address: '21 Greams Lane, Thousand Lights West', beds: 600, icuBeds: 140, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Gleneagles Global Health City Perumbakkam', city: 'Chennai', accreditation: 'NABH & JCI', address: '439, Cheran Nagar, Perumbakkam', beds: 1000, icuBeds: 200, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Fortis Malar Hospital Adyar', city: 'Chennai', accreditation: 'NABH Accredited', address: 'No. 52, 1st Main Rd, Gandhi Nagar, Adyar', beds: 180, icuBeds: 40, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'MGM Healthcare Nelson Manickam Road', city: 'Chennai', accreditation: 'JCI Accredited', address: 'New No 72, Old No 54, Nelson Manickam Rd, Aminjikarai', beds: 400, icuBeds: 100, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'MIOT International Manapakkam', city: 'Chennai', accreditation: 'NABH & JCI', address: '4/112, Mount Poonamallee Rd, Sathya Nagar, Manapakkam', beds: 1000, icuBeds: 180, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Kauvery Hospital Alwarpet', city: 'Chennai', accreditation: 'NABH Accredited', address: 'No. 199, Luz Church Rd, Mylapore', beds: 200, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'SIMS Hospital Vadapalani', city: 'Chennai', accreditation: 'NABH & JCI', address: 'Metro No 1, Jawaharlal Nehru Salai, Vadapalani', beds: 345, icuBeds: 75, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Apollo Proton Cancer Centre Taramani', city: 'Chennai', accreditation: 'JCI Accredited', address: '100 Feet Road, Tharamani', beds: 150, icuBeds: 40, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Dr. Rela Institute & Medical Centre', city: 'Chennai', accreditation: 'NABH & JCI', address: '7, CLC Works Rd, Nagappa Nagar, Chromepet', beds: 450, icuBeds: 130, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Prashanth Super Speciality Hospital Velachery', city: 'Chennai', accreditation: 'NABH Accredited', address: '36 & 36A, Velachery Main Rd', beds: 250, icuBeds: 50, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Sundaram Medical Foundation Shanthi Colony', city: 'Chennai', accreditation: 'NABH Accredited', address: '9-C, 4th Avenue, Shanthi Colony, Anna Nagar', beds: 200, icuBeds: 40, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Billroth Hospitals Shenoy Nagar', city: 'Chennai', accreditation: 'NABH Accredited', address: '43, Lakshmi Talkies Rd, Shenoy Nagar', beds: 220, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Chettinad Super Speciality Hospital', city: 'Chennai', accreditation: 'NABH Accredited', address: 'Rajiv Gandhi Salai, Kelambakkam', beds: 600, icuBeds: 110, imageUrl: HOSPITAL_PHOTOS[6] },

  // Kolkata (72-81)
  { name: 'Apollo Gleneagles Hospitals EM Bypass', city: 'Kolkata', accreditation: 'JCI Accredited', address: '58 Canal Circular Road, Kadapara, Phool Bagan', beds: 700, icuBeds: 160, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Fortis Hospital Anandapur', city: 'Kolkata', accreditation: 'NABH Accredited', address: '730, Anandapur, E.M. Bypass Road', beds: 400, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Medica Superspecialty Hospital Mukundapur', city: 'Kolkata', accreditation: 'NABH & JCI', address: '127 Mukundapur, E.M Bypass', beds: 500, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'AMRI Hospitals Dhakuria', city: 'Kolkata', accreditation: 'NABH Accredited', address: 'P-4 & 5, CIT Scheme LXXII, Block-A, Gariahat Rd', beds: 350, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Ruby General Hospital Kasba', city: 'Kolkata', accreditation: 'NABH Accredited', address: 'Kasba Golpark, E. M. Bypass', beds: 278, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Peerless Hospital & B.K. Roy Research Centre', city: 'Kolkata', accreditation: 'NABH Accredited', address: '360, Panchasayar', beds: 400, icuBeds: 85, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Tata Medical Center New Town', city: 'Kolkata', accreditation: 'NABH Accredited', address: '14 Major Arterial Road (EW), New Town, Rajarhat', beds: 437, icuBeds: 95, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Desun Hospital EM Bypass', city: 'Kolkata', accreditation: 'NABH Accredited', address: 'Desun More, 720, Eastern Metropolitan Bypass', beds: 300, icuBeds: 70, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Belle Vue Clinic Loudon Street', city: 'Kolkata', accreditation: 'NABH Accredited', address: '9, Dr. U. N. Brahmachari St, Elgin', beds: 240, icuBeds: 50, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Woodlands Multispeciality Hospital Alipore', city: 'Kolkata', accreditation: 'NABH Accredited', address: '8/5, Alipore Rd, Alipore', beds: 250, icuBeds: 55, imageUrl: HOSPITAL_PHOTOS[0] },

  // Pune (82-91)
  { name: 'Ruby Hall Clinic Sassoon Road', city: 'Pune', accreditation: 'NABH & JCI', address: '40, Sassoon Road, Sangamvadi', beds: 600, icuBeds: 130, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Jehangir Hospital Bund Garden Road', city: 'Pune', accreditation: 'NABH Accredited', address: '32, Sassoon Rd, Opposite Pune Railway Station', beds: 350, icuBeds: 75, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'Sahyadri Super Speciality Hospital Deccan Gymkhana', city: 'Pune', accreditation: 'NABH Accredited', address: 'Plot No. 30 C, Erandwane, Karve Rd', beds: 200, icuBeds: 50, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'Manipal Hospital Kharadi', city: 'Pune', accreditation: 'NABH Accredited', address: 'Survey No. 22, Mundhwa - Kharadi Rd', beds: 250, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'Deenanath Mangeshkar Hospital Erandwane', city: 'Pune', accreditation: 'NABH Accredited', address: 'Near Mhatre Bridge, Erandwane', beds: 800, icuBeds: 160, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Jupiter Hospital Baner', city: 'Pune', accreditation: 'NABH Accredited', address: 'Near Prathamesh Park, Aundh-Ravet BRTS Road, Baner', beds: 350, icuBeds: 80, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Sancheti Institute for Orthopaedics & Rehabilitation', city: 'Pune', accreditation: 'NABH Accredited', address: '16, Shivajinagar, Narveer Tanaji Wadi', beds: 200, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'Aditya Birla Memorial Hospital Chinchwad', city: 'Pune', accreditation: 'JCI Accredited', address: 'Aditya Birla Hospital Marg, Thergaon, Chinchwad', beds: 500, icuBeds: 110, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Noble Hospital Hadapsar', city: 'Pune', accreditation: 'NABH Accredited', address: '153, Magarpatta City Rd, Hadapsar', beds: 250, icuBeds: 55, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Inamdar Multispeciality Hospital Fatima Nagar', city: 'Pune', accreditation: 'NABH Accredited', address: 'Hospital Building, S No 15, Fatima Nagar, Wanowrie', beds: 180, icuBeds: 40, imageUrl: HOSPITAL_PHOTOS[2] },

  // Ahmedabad (92-100)
  { name: 'Apollo Hospitals International Gandhinagar-Ahmedabad', city: 'Ahmedabad', accreditation: 'JCI Accredited', address: 'Plot No.1 A, Bhat GIDC Estate, Gandhinagar', beds: 400, icuBeds: 90, imageUrl: HOSPITAL_PHOTOS[3] },
  { name: 'KD Hospital (Kusum Dhirajlal Hospital) SG Highway', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'S.G. Highway, Vaishnodevi Circle', beds: 300, icuBeds: 65, imageUrl: HOSPITAL_PHOTOS[4] },
  { name: 'CIMS Hospital (Marengo CIMS) Science City Road', city: 'Ahmedabad', accreditation: 'JCI Accredited', address: 'Off Science City Road, Sola', beds: 450, icuBeds: 100, imageUrl: HOSPITAL_PHOTOS[5] },
  { name: 'Shalby Hospitals SG Highway', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'Opp. Karnavati Club, S.G. Highway', beds: 350, icuBeds: 70, imageUrl: HOSPITAL_PHOTOS[6] },
  { name: 'Sterling Hospital Memnagar', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'Sterling Hospital Road, Memnagar', beds: 290, icuBeds: 60, imageUrl: HOSPITAL_PHOTOS[7] },
  { name: 'HCG Cancer Centre Sola', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'Science City Road, Off S.G. Highway, Sola', beds: 150, icuBeds: 35, imageUrl: HOSPITAL_PHOTOS[0] },
  { name: 'Epic Hospital Bodakdev', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'Near Kargil Petrol Pump, S.G Highway', beds: 200, icuBeds: 45, imageUrl: HOSPITAL_PHOTOS[1] },
  { name: 'Zydus Hospitals Thaltej', city: 'Ahmedabad', accreditation: 'NABH & JCI', address: 'Zydus Hospitals Road, Nr. Sola Bridge, Thaltej', beds: 550, icuBeds: 120, imageUrl: HOSPITAL_PHOTOS[2] },
  { name: 'SAL Hospital & Medical Institute', city: 'Ahmedabad', accreditation: 'NABH Accredited', address: 'Opposite Doordarshan Kendra, Drive-In Road, Thaltej', beds: 300, icuBeds: 65, imageUrl: HOSPITAL_PHOTOS[3] }
];

export const RAW_DOCTORS: SeedDoctorInput[] = [
  {
    name: 'Dr. Ashok Vaid',
    specialty: 'Surgical Oncology',
    credentials: 'MBBS, MD, DM (Medical Oncology), FICP',
    yearsExp: 28,
    fee: 1800,
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Ramakanta Panda',
    specialty: 'Cardiothoracic Surgery',
    credentials: 'MCh (Cardiovascular Thoracic Surgery), FRCS, Cleveland Clinic Fellow',
    yearsExp: 32,
    fee: 2500,
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Vikram Shah',
    specialty: 'Orthopedics & Joint Reconstruction',
    credentials: 'MS (Ortho), AO Fellow (Germany), Joint Replacement Specialist',
    yearsExp: 26,
    fee: 1500,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Pradeep Chowbey',
    specialty: 'Surgical Gastroenterology & Laparoscopy',
    credentials: 'MS, MNAMS, FICS, FACS, Pioneer in Minimal Access Surgery',
    yearsExp: 30,
    fee: 2000,
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. B. K. Misra',
    specialty: 'Neurosurgery & Spine',
    credentials: 'MBBS, MS, MCh (Neurosurgery), WFNS Fellow',
    yearsExp: 29,
    fee: 2200,
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Mahesh Desai',
    specialty: 'Urology & Endourology',
    credentials: 'MS, FRCS (Edin), FRCS (Glasg), MCh (Urology)',
    yearsExp: 31,
    fee: 1700,
    photoUrl: 'https://images.unsplash.com/photo-1594824813593-3d02a5c54d37?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Malavika Sabharwal',
    specialty: 'Gynecology & Laparoscopic Surgery',
    credentials: 'MD, FICOG, FICMCH, Gynecologic Endoscopy Specialist',
    yearsExp: 22,
    fee: 1400,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Devi Prasad Shetty',
    specialty: 'Cardiothoracic Surgery',
    credentials: 'MS, FRCS (England), Founder Narayana Health',
    yearsExp: 34,
    fee: 2500,
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. K. S. Gopinath',
    specialty: 'Surgical Oncology',
    credentials: 'MS, MCh (Surgical Oncology), FAMS, FRCS (Edin)',
    yearsExp: 27,
    fee: 1900,
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Sanjay Sachdeva',
    specialty: 'Head, Neck & Endocrine Surgery',
    credentials: 'MS (ENT), DLO, Specialist in Skull Base & Endocrine Surgery',
    yearsExp: 24,
    fee: 1300,
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Naresh Trehan',
    specialty: 'Cardiothoracic Surgery',
    credentials: 'MD, FACS, FACC, Pioneering Cardiovascular Surgeon',
    yearsExp: 35,
    fee: 2500,
    photoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Nandkishore Kapadia',
    specialty: 'Cardiothoracic Surgery',
    credentials: 'MS, MCh (CTVS), FIACS, Heart Transplant Specialist',
    yearsExp: 25,
    fee: 2100,
    photoUrl: 'https://images.unsplash.com/photo-1594824813593-3d02a5c54d37?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Arvind Kumar',
    specialty: 'Thoracic & Robotic Surgery',
    credentials: 'MBBS, MS, Robotic Chest Surgery Pioneer',
    yearsExp: 28,
    fee: 2000,
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Sajan K. Hegde',
    specialty: 'Neurosurgery & Spine',
    credentials: 'MS (Ortho), Cotrel-Dubousset Spine Fellow, Complex Spine Surgeon',
    yearsExp: 26,
    fee: 1800,
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Rajesh Ahlawat',
    specialty: 'Urology & Endourology',
    credentials: 'MS, MCh, Robotic Kidney Transplant Pioneer',
    yearsExp: 29,
    fee: 2200,
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dr. Sunita Tandulwadkar',
    specialty: 'Gynecology & Laparoscopic Surgery',
    credentials: 'MD, FICOG, Advanced Endoscopic Surgeon',
    yearsExp: 23,
    fee: 1400,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'
  }
];

const DEMO_PASSWORD_HASH = bcrypt.hashSync('patient123', 10);

export const INITIAL_DEMO_PATIENTS: Patient[] = [
  {
    id: 'pat_demo_001',
    fullName: 'Rajesh Ramanathan',
    phone: '+91 98201 44521',
    age: 58,
    gender: 'Male',
    city: 'Mumbai',
    email: 'rajesh.ramanathan@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'PATIENT',
    budgetCap: 350000,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'pat_demo_002',
    fullName: 'Ananya Sharma',
    phone: '+91 99102 78341',
    age: 46,
    gender: 'Female',
    city: 'Delhi NCR',
    email: 'ananya.sharma@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'PATIENT',
    budgetCap: 450000,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'pat_demo_003',
    fullName: 'Venkatesh Murthy',
    phone: '+91 94480 32190',
    age: 63,
    gender: 'Male',
    city: 'Bangalore',
    email: 'v.murthy@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    role: 'PATIENT',
    budgetCap: 600000,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: 'asm_demo_001',
    patientId: 'pat_demo_001',
    illnessText: 'Severe right knee stiffness and persistent pain when climbing stairs for over 8 months. Difficulty walking more than 100 meters without halting.',
    conditionKey: 'Severe Osteoarthritis Knee (End-stage)',
    conditionDetail: 'Bilateral knee crepitus with severe right medial compartment degeneration',
    durationBucket: '6+ months',
    severity: 8,
    symptoms: ['Severe Joint Pain & Morning Stiffness', 'Difficulty Walking or Weight Bearing', 'Joint Locking or Giving Way'],
    preExisting: ['Hypertension (High BP)'],
    medicalHistoryText: 'Hypertensive for 6 years on regular amlodipine. No prior surgeries.',
    aiPredictedSurgery: 'Total Knee Arthroplasty (TKR / Robotic Joint Replacement)',
    aiPriority: 'Moderate Priority / Schedule Within 1-2 Weeks',
    aiSummary: 'Patient presents with advanced functional impairment and Grade IV medial osteoarthritis of the right knee. Surgical replacement will restore mechanical alignment, relieve pain, and restore independent mobility.',
    status: 'Assessed & Predicted',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'asm_demo_002',
    patientId: 'pat_demo_002',
    illnessText: 'Frequent upper right quadrant abdominal colic after heavy meals accompanied by nausea and bloating. Ultrasound confirmed multiple mobile calculi in gallbladder.',
    conditionKey: 'Gallbladder Stones / Acute Cholecystitis',
    conditionDetail: 'Multiple gallstones ranging 4mm to 11mm with gallbladder wall thickening',
    durationBucket: '1-4 weeks',
    severity: 7,
    symptoms: ['Sharp Abdominal Pain', 'Nausea & Persistent Vomiting', 'Post-Meal Upper Abdominal Bloating'],
    preExisting: ['No Known Pre-existing Conditions'],
    medicalHistoryText: 'No previous hospital admissions.',
    aiPredictedSurgery: 'Laparoscopic Cholecystectomy (Minimally Invasive Gallbladder Removal)',
    aiPriority: 'Moderate Priority / Schedule Within 1-2 Weeks',
    aiSummary: 'Symptomatic cholelithiasis with recurrent biliary colic risks acute calculous cholecystitis, choledocholithiasis, or pancreatitis. Elective laparoscopic cholecystectomy is standard of care.',
    status: 'Assessed & Predicted',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'asm_demo_003',
    patientId: 'pat_demo_003',
    illnessText: 'Chest tightness radiating to the jaw on climbing one flight of stairs. Relieved after 5 minutes of rest. Treadmill stress test was positive for inducible ischemia.',
    conditionKey: 'Coronary Artery Disease (Severe Blockage)',
    conditionDetail: 'Angiography revealed critical LAD 85% stenosis and LCx 75% stenosis',
    durationBucket: '1-6 months',
    severity: 9,
    symptoms: ['Chest Tightness or Heaviness', 'Shortness of Breath on Exertion'],
    preExisting: ['Type 2 Diabetes', 'Hypertension (High BP)'],
    medicalHistoryText: 'Diabetic for 12 years, taking metformin and glimepiride. Mild dyslipidemia on statin therapy.',
    aiPredictedSurgery: 'Coronary Artery Bypass Grafting (CABG) / Off-Pump Bypass Surgery',
    aiPriority: 'Urgent Priority / Schedule Immediate Evaluation',
    aiSummary: 'Significant multivessel coronary disease with ischemic threshold on minimal exertion in a diabetic individual. Revascularization via CABG provides optimal long-term survival benefit and reintervention avoidance.',
    status: 'Assessed & Predicted',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_DEMO_INQUIRIES: Inquiry[] = [
  {
    id: 'inq_demo_001',
    patientId: 'pat_demo_001',
    hospitalId: 'hosp_1',
    hospitalName: 'Kokilaben Dhirubhai Ambani Hospital',
    procedure: 'Total Knee Arthroplasty (TKR / Robotic Joint Replacement)',
    status: 'Contacted',
    notes: 'Counselor contacted patient. Medical reports requested for review.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'inq_demo_002',
    patientId: 'pat_demo_002',
    hospitalId: 'hosp_17',
    hospitalName: 'Max Super Speciality Hospital Saket',
    procedure: 'Laparoscopic Cholecystectomy (Minimally Invasive Gallbladder Removal)',
    status: 'New',
    notes: 'Inquiry received via online cost calculator.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

