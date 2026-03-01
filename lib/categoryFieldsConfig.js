/**
 * Category-Specific Fields Configuration
 * Defines dynamic fields that appear based on selected category.
 * Each field has: key, label, type, placeholder, required, options (for select)
 */

const CATEGORY_FIELDS = {
    Electronics: [
        { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Apple, Samsung, Dell' },
        { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. iPhone 14 Pro, Galaxy S24' },
        { key: 'serialNumber', label: 'Serial Number', type: 'text', placeholder: 'Device serial/IMEI number' },
        { key: 'chargerIncluded', label: 'Charger Included?', type: 'select', options: ['Not Sure', 'Yes', 'No'] },
        { key: 'storageCapacity', label: 'Storage Capacity', type: 'text', placeholder: 'e.g. 128GB, 256GB' },
    ],
    Books: [
        { key: 'author', label: 'Author', type: 'text', placeholder: 'e.g. James Stewart' },
        { key: 'isbn', label: 'ISBN', type: 'text', placeholder: 'e.g. 978-0-123456-78-9' },
        { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Mathematics, Computer Science' },
        { key: 'publisher', label: 'Publisher', type: 'text', placeholder: 'e.g. Pearson, McGraw-Hill' },
    ],
    Clothing: [
        { key: 'size', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Other'] },
        { key: 'material', label: 'Material', type: 'text', placeholder: 'e.g. Cotton, Polyester, Denim' },
        { key: 'pattern', label: 'Pattern', type: 'text', placeholder: 'e.g. Striped, Solid, Plaid' },
        { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Adidas, Zara' },
    ],
    Keys: [
        { key: 'numberOfKeys', label: 'Number of Keys', type: 'text', placeholder: 'e.g. 3' },
        { key: 'keychainDescription', label: 'Keychain Description', type: 'text', placeholder: 'e.g. Red lanyard with university logo' },
        { key: 'keyType', label: 'Key Type', type: 'select', options: ['House Key', 'Car Key', 'Locker Key', 'Office Key', 'Mixed', 'Other'] },
    ],
    'ID Card': [
        { key: 'idNumber', label: 'ID Number', type: 'text', placeholder: 'e.g. IT22222222', required: true },
        { key: 'faculty', label: 'Faculty', type: 'text', placeholder: 'e.g. Faculty of Computing' },
        { key: 'yearOfStudy', label: 'Year of Study', type: 'select', options: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Staff'] },
        { key: 'expiryDate', label: 'Expiry Date', type: 'date', placeholder: '' },
    ],
    Bag: [
        { key: 'bagType', label: 'Bag Type', type: 'select', options: ['Backpack', 'Handbag', 'Laptop Bag', 'Tote Bag', 'Sling Bag', 'Other'] },
        { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Jansport, Herschel' },
        { key: 'itemsInside', label: 'Items Inside (Description)', type: 'textarea', placeholder: 'Describe what was inside the bag...' },
    ],
    Jewelry: [
        { key: 'metalType', label: 'Metal Type', type: 'select', options: ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'Stainless Steel', 'Other'] },
        { key: 'engravingDetails', label: 'Engraving Details', type: 'text', placeholder: 'e.g. Initials "JD" on the back' },
        { key: 'gemstoneType', label: 'Gemstone Type', type: 'text', placeholder: 'e.g. Diamond, Ruby, Sapphire, None' },
    ],
    Sports: [
        { key: 'equipmentType', label: 'Equipment Type', type: 'text', placeholder: 'e.g. Tennis Racket, Football, Yoga Mat' },
        { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Adidas, Wilson' },
        { key: 'teamLogo', label: 'Team Logo Present?', type: 'select', options: ['No', 'Yes'] },
    ],
    Other: [],
}

export default CATEGORY_FIELDS
