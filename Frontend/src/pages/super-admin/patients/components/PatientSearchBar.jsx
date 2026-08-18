import SearchBar from '@components/forms/SearchBar/SearchBar';

const PatientSearchBar = ({ value, onChange }) => (
  <SearchBar
    value={value}
    onChange={onChange}
    placeholder="Search patients, email, mobile..."
    className="max-w-sm"
  />
);

export default PatientSearchBar;
