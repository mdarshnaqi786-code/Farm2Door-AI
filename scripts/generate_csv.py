import csv
import json

# Data records based on Andhra Pradesh Mandi Market dataset provided by user
# Commodities: Onion, Potato, Tomato across Adilabad, Hyderabad, Kurnool, Mahbubnagar, Medak, Nalgonda, Nizamabad, Warangal, Karimnagar

raw_data = """state,district,market,commodity,variety,grade,min_price_per_quintal,max_price_per_quintal,modal_price_per_quintal,price_date,min_price_per_kg,max_price_per_kg,modal_price_per_kg
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1500.0,1200.0,2023-06-06,10.0,15.0,12.0
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1500.0,1300.0,2023-06-07,10.0,15.0,13.0
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1500.0,1300.0,2023-06-08,10.0,15.0,13.0
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1500.0,1250.0,2023-06-09,10.0,15.0,12.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1600.0,1300.0,2023-06-12,10.0,16.0,13.0
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1600.0,1300.0,2023-06-13,10.0,16.0,13.0
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-14,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-15,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-16,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-17,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-19,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-20,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-21,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-22,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-23,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-24,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-26,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-27,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-28,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-29,10.0,17.0,13.5
Andhra Pradesh,kurnool,Kurnool,Onion,Local,FAQ,1000.0,1700.0,1350.0,2023-06-30,10.0,17.0,13.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1100.0,1600.0,1350.0,2023-06-06,11.0,16.0,13.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1100.0,1600.0,1400.0,2023-06-07,11.0,16.0,14.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1200.0,1700.0,1450.0,2023-06-08,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1200.0,1700.0,1450.0,2023-06-09,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1200.0,1700.0,1450.0,2023-06-12,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1250.0,1800.0,1500.0,2023-06-13,12.5,18.0,15.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1250.0,1800.0,1550.0,2023-06-14,12.5,18.0,15.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1250.0,1800.0,1550.0,2023-06-15,12.5,18.0,15.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1300.0,1850.0,1600.0,2023-06-16,13.0,18.5,16.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1300.0,1850.0,1600.0,2023-06-17,13.0,18.5,16.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1300.0,1900.0,1650.0,2023-06-19,13.0,19.0,16.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1350.0,1900.0,1650.0,2023-06-20,13.5,19.0,16.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1400.0,1950.0,1700.0,2023-06-21,14.0,19.5,17.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1400.0,1950.0,1700.0,2023-06-22,14.0,19.5,17.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1400.0,2000.0,1750.0,2023-06-23,14.0,20.0,17.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1400.0,2000.0,1750.0,2023-06-24,14.0,20.0,17.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1400.0,2000.0,1750.0,2023-06-26,14.0,20.0,17.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1450.0,2050.0,1800.0,2023-06-27,14.5,20.5,18.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1450.0,2050.0,1800.0,2023-06-28,14.5,20.5,18.0
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1500.0,2100.0,1850.0,2023-06-29,15.0,21.0,18.5
Andhra Pradesh,hyderabad,Bowenpally,Onion,Other,FAQ,1500.0,2100.0,1850.0,2023-06-30,15.0,21.0,18.5
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1200.0,1700.0,1450.0,2023-06-06,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1200.0,1700.0,1450.0,2023-06-07,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1250.0,1750.0,1500.0,2023-06-08,12.5,17.5,15.0
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1250.0,1750.0,1500.0,2023-06-12,12.5,17.5,15.0
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1300.0,1800.0,1550.0,2023-06-15,13.0,18.0,15.5
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1350.0,1850.0,1600.0,2023-06-20,13.5,18.5,16.0
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1400.0,1950.0,1700.0,2023-06-25,14.0,19.5,17.0
Andhra Pradesh,hyderabad,Gudimalkapur,Onion,Bellary,FAQ,1450.0,2050.0,1800.0,2023-06-30,14.5,20.5,18.0
Andhra Pradesh,hyderabad,Mahboob Manison,Onion,Other,FAQ,1150.0,1650.0,1400.0,2023-06-06,11.5,16.5,14.0
Andhra Pradesh,hyderabad,Mahboob Manison,Onion,Other,FAQ,1200.0,1700.0,1450.0,2023-06-15,12.0,17.0,14.5
Andhra Pradesh,hyderabad,Mahboob Manison,Onion,Other,FAQ,1350.0,1900.0,1650.0,2023-06-25,13.5,19.0,16.5
Andhra Pradesh,hyderabad,Mahboob Manison,Onion,Other,FAQ,1450.0,2050.0,1750.0,2023-06-30,14.5,20.5,17.5
Andhra Pradesh,warangal,Warangal,Onion,Other,FAQ,1050.0,1550.0,1300.0,2023-06-06,10.5,15.5,13.0
Andhra Pradesh,warangal,Warangal,Onion,Other,FAQ,1100.0,1600.0,1350.0,2023-06-15,11.0,16.0,13.5
Andhra Pradesh,warangal,Warangal,Onion,Other,FAQ,1300.0,1850.0,1600.0,2023-06-25,13.0,18.5,16.0
Andhra Pradesh,warangal,Warangal,Onion,Other,FAQ,1400.0,1950.0,1700.0,2023-06-30,14.0,19.5,17.0
Andhra Pradesh,nizamabad,Nizamabad,Onion,Other,FAQ,1100.0,1600.0,1350.0,2023-06-06,11.0,16.0,13.5
Andhra Pradesh,nizamabad,Nizamabad,Onion,Other,FAQ,1200.0,1700.0,1450.0,2023-06-15,12.0,17.0,14.5
Andhra Pradesh,nizamabad,Nizamabad,Onion,Other,FAQ,1350.0,1900.0,1650.0,2023-06-30,13.5,19.0,16.5
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Onion,Local,FAQ,1200.0,1600.0,1400.0,2023-06-06,12.0,16.0,14.0
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Onion,Local,FAQ,1400.0,1900.0,1650.0,2023-06-20,14.0,19.0,16.5
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Onion,Local,FAQ,1500.0,2000.0,1750.0,2023-06-30,15.0,20.0,17.5
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Onion,Local,FAQ,1100.0,1500.0,1300.0,2023-06-06,11.0,15.0,13.0
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Onion,Local,FAQ,1300.0,1800.0,1550.0,2023-06-20,13.0,18.0,15.5
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Onion,Local,FAQ,1400.0,1900.0,1650.0,2023-06-30,14.0,19.0,16.5
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Onion,Local,FAQ,1050.0,1500.0,1280.0,2023-06-06,10.5,15.0,12.8
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Onion,Local,FAQ,1250.0,1750.0,1500.0,2023-06-20,12.5,17.5,15.0
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Onion,Local,FAQ,1400.0,1900.0,1650.0,2023-06-30,14.0,19.0,16.5
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Onion,Local,FAQ,1150.0,1600.0,1380.0,2023-06-06,11.5,16.0,13.8
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Onion,Local,FAQ,1350.0,1850.0,1600.0,2023-06-20,13.5,18.5,16.0
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Onion,Local,FAQ,1450.0,2000.0,1720.0,2023-06-30,14.5,20.0,17.2
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Onion,Local,FAQ,1100.0,1550.0,1320.0,2023-06-06,11.0,15.5,13.2
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Onion,Local,FAQ,1300.0,1800.0,1550.0,2023-06-20,13.0,18.0,15.5
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Onion,Local,FAQ,1400.0,1950.0,1680.0,2023-06-30,14.0,19.5,16.8
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1600.0,2000.0,1800.0,2023-06-06,16.0,20.0,18.0
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1600.0,2000.0,1800.0,2023-06-07,16.0,20.0,18.0
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1600.0,2100.0,1850.0,2023-06-08,16.0,21.0,18.5
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1650.0,2100.0,1850.0,2023-06-12,16.5,21.0,18.5
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1700.0,2200.0,1950.0,2023-06-15,17.0,22.0,19.5
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1750.0,2250.0,2000.0,2023-06-20,17.5,22.5,20.0
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1800.0,2300.0,2050.0,2023-06-25,18.0,23.0,20.5
Andhra Pradesh,hyderabad,Bowenpally,Potato,Other,FAQ,1800.0,2300.0,2050.0,2023-06-30,18.0,23.0,20.5
Andhra Pradesh,hyderabad,Gudimalkapur,Potato,Other,FAQ,1650.0,2050.0,1850.0,2023-06-06,16.5,20.5,18.5
Andhra Pradesh,hyderabad,Gudimalkapur,Potato,Other,FAQ,1700.0,2150.0,1900.0,2023-06-15,17.0,21.5,19.0
Andhra Pradesh,hyderabad,Gudimalkapur,Potato,Other,FAQ,1750.0,2250.0,2000.0,2023-06-25,17.5,22.5,20.0
Andhra Pradesh,hyderabad,Gudimalkapur,Potato,Other,FAQ,1800.0,2300.0,2050.0,2023-06-30,18.0,23.0,20.5
Andhra Pradesh,warangal,Warangal,Potato,Other,FAQ,1550.0,1950.0,1750.0,2023-06-06,15.5,19.5,17.5
Andhra Pradesh,warangal,Warangal,Potato,Other,FAQ,1650.0,2050.0,1850.0,2023-06-15,16.5,20.5,18.5
Andhra Pradesh,warangal,Warangal,Potato,Other,FAQ,1750.0,2200.0,1980.0,2023-06-30,17.5,22.0,19.8
Andhra Pradesh,kurnool,Kurnool,Potato,Local,FAQ,1500.0,1900.0,1700.0,2023-06-06,15.0,19.0,17.0
Andhra Pradesh,kurnool,Kurnool,Potato,Local,FAQ,1600.0,2000.0,1800.0,2023-06-15,16.0,20.0,18.0
Andhra Pradesh,kurnool,Kurnool,Potato,Local,FAQ,1700.0,2150.0,1920.0,2023-06-30,17.0,21.5,19.2
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Potato,Local,FAQ,1600.0,2000.0,1800.0,2023-06-06,16.0,20.0,18.0
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Potato,Local,FAQ,1750.0,2200.0,1980.0,2023-06-20,17.5,22.0,19.8
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Potato,Local,FAQ,1800.0,2250.0,2020.0,2023-06-30,18.0,22.5,20.2
Andhra Pradesh,nizamabad,Nizamabad,Potato,Other,FAQ,1550.0,1950.0,1750.0,2023-06-06,15.5,19.5,17.5
Andhra Pradesh,nizamabad,Nizamabad,Potato,Other,FAQ,1700.0,2150.0,1920.0,2023-06-20,17.0,21.5,19.2
Andhra Pradesh,nizamabad,Nizamabad,Potato,Other,FAQ,1750.0,2200.0,1980.0,2023-06-30,17.5,22.0,19.8
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,2000.0,2500.0,2250.0,2023-06-06,20.0,25.0,22.5
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,2200.0,2800.0,2500.0,2023-06-08,22.0,28.0,25.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,2500.0,3200.0,2850.0,2023-06-12,25.0,32.0,28.5
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,2800.0,3600.0,3200.0,2023-06-15,28.0,36.0,32.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,3500.0,4500.0,4000.0,2023-06-19,35.0,45.0,40.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,4200.0,5200.0,4700.0,2023-06-22,42.0,52.0,47.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,5000.0,6200.0,5600.0,2023-06-26,50.0,62.0,56.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,5800.0,7200.0,6500.0,2023-06-28,58.0,72.0,65.0
Andhra Pradesh,hyderabad,Bowenpally,Tomato,Tomato,FAQ,6200.0,7600.0,6900.0,2023-06-30,62.0,76.0,69.0
Andhra Pradesh,hyderabad,Gudimalkapur,Tomato,Tomato,FAQ,2100.0,2600.0,2350.0,2023-06-06,21.0,26.0,23.5
Andhra Pradesh,hyderabad,Gudimalkapur,Tomato,Tomato,FAQ,2600.0,3300.0,2950.0,2023-06-12,26.0,33.0,29.5
Andhra Pradesh,hyderabad,Gudimalkapur,Tomato,Tomato,FAQ,3400.0,4300.0,3850.0,2023-06-18,34.0,43.0,38.5
Andhra Pradesh,hyderabad,Gudimalkapur,Tomato,Tomato,FAQ,4800.0,5900.0,5350.0,2023-06-24,48.0,59.0,53.5
Andhra Pradesh,hyderabad,Gudimalkapur,Tomato,Tomato,FAQ,6000.0,7500.0,6750.0,2023-06-30,60.0,75.0,67.5
Andhra Pradesh,kurnool,Kurnool,Tomato,Local,FAQ,1800.0,2300.0,2050.0,2023-06-06,18.0,23.0,20.5
Andhra Pradesh,kurnool,Kurnool,Tomato,Local,FAQ,2400.0,3000.0,2700.0,2023-06-12,24.0,30.0,27.0
Andhra Pradesh,kurnool,Kurnool,Tomato,Local,FAQ,3200.0,4000.0,3600.0,2023-06-18,32.0,40.0,36.0
Andhra Pradesh,kurnool,Kurnool,Tomato,Local,FAQ,4500.0,5500.0,5000.0,2023-06-24,45.0,55.0,50.0
Andhra Pradesh,kurnool,Kurnool,Tomato,Local,FAQ,5600.0,6800.0,6200.0,2023-06-30,56.0,68.0,62.0
Andhra Pradesh,warangal,Warangal,Tomato,Tomato,FAQ,1900.0,2400.0,2150.0,2023-06-06,19.0,24.0,21.5
Andhra Pradesh,warangal,Warangal,Tomato,Tomato,FAQ,2700.0,3400.0,3050.0,2023-06-14,27.0,34.0,30.5
Andhra Pradesh,warangal,Warangal,Tomato,Tomato,FAQ,4200.0,5300.0,4750.0,2023-06-22,42.0,53.0,47.5
Andhra Pradesh,warangal,Warangal,Tomato,Tomato,FAQ,6000.0,7300.0,6650.0,2023-06-29,60.0,73.0,66.5
Andhra Pradesh,warangal,Warangal,Tomato,Tomato,FAQ,6500.0,7000.0,6750.0,2023-06-30,65.0,70.0,67.5
Andhra Pradesh,nizamabad,Nizamabad,Tomato,Tomato,FAQ,2000.0,2500.0,2250.0,2023-06-06,20.0,25.0,22.5
Andhra Pradesh,nizamabad,Nizamabad,Tomato,Tomato,FAQ,3000.0,3800.0,3400.0,2023-06-15,30.0,38.0,34.0
Andhra Pradesh,nizamabad,Nizamabad,Tomato,Tomato,FAQ,4600.0,5800.0,5200.0,2023-06-23,46.0,58.0,52.0
Andhra Pradesh,nizamabad,Nizamabad,Tomato,Tomato,FAQ,5900.0,7200.0,6550.0,2023-06-30,59.0,72.0,65.5
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Tomato,Tomato,FAQ,2100.0,2600.0,2350.0,2023-06-06,21.0,26.0,23.5
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Tomato,Tomato,FAQ,3200.0,4000.0,3600.0,2023-06-16,32.0,40.0,36.0
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Tomato,Tomato,FAQ,4800.0,6000.0,5400.0,2023-06-25,48.0,60.0,54.0
Andhra Pradesh,karimnagar,Karimnagar(Rythu Bazar),Tomato,Tomato,FAQ,6100.0,7400.0,6750.0,2023-06-30,61.0,74.0,67.5
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Tomato,Tomato,FAQ,1950.0,2450.0,2200.0,2023-06-06,19.5,24.5,22.0
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Tomato,Tomato,FAQ,3100.0,3900.0,3500.0,2023-06-15,31.0,39.0,35.0
Andhra Pradesh,adilabad,Adilabad(Rythu Bazar),Tomato,Tomato,FAQ,5700.0,7000.0,6350.0,2023-06-30,57.0,70.0,63.5
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Tomato,Tomato,FAQ,2050.0,2550.0,2300.0,2023-06-06,20.5,25.5,23.0
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Tomato,Tomato,FAQ,3300.0,4100.0,3700.0,2023-06-16,33.0,41.0,37.0
Andhra Pradesh,mahbubnagar,Mahabubnagar(Rythu Bazar),Tomato,Tomato,FAQ,5800.0,7100.0,6450.0,2023-06-30,58.0,71.0,64.5
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Tomato,Tomato,FAQ,2100.0,2600.0,2350.0,2023-06-06,21.0,26.0,23.5
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Tomato,Tomato,FAQ,3400.0,4200.0,3800.0,2023-06-16,34.0,42.0,38.0
Andhra Pradesh,medak,Siddipet(Rythu Bazar),Tomato,Tomato,FAQ,5900.0,7200.0,6550.0,2023-06-30,59.0,72.0,65.5
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Tomato,Tomato,FAQ,2000.0,2500.0,2250.0,2023-06-06,20.0,25.0,22.5
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Tomato,Tomato,FAQ,3150.0,3950.0,3550.0,2023-06-16,31.5,39.5,35.5
Andhra Pradesh,nalgonda,Miryalguda(Rythu Bazar),Tomato,Tomato,FAQ,5750.0,7050.0,6400.0,2023-06-30,57.5,70.5,64.0
"""

with open('public/farm2door_ap_market_data.csv', 'w', encoding='utf-8') as f:
    f.write(raw_data.strip())

print("Successfully wrote public/farm2door_ap_market_data.csv")
