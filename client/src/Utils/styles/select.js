export const select = {
    control: (provided, state) => ({
        ...provided,
        color: '#5ED5A8',
        backgroundColor: '#161C22',
        borderRadius: '10px',
        borderColor: '#5ED5A8',
        border: 'none',
        "&:hover": {
            border: "1px solid #5ED5A8",
            boxShadow: "0px 0px 6px #5ED5A8"
        }
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: '#5ED5A8',
        backgroundColor: '#1D252C',
        // border: 'none',
        borderRadius: '0 10px 10px 0'
    }),
    indicatorsContainer: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
    }),
    indicatorSeparator: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
        // fontSize: '18px'
    }),
    input: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        // backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px',
        // fontSize: '18px'
    }),
    loadingIndicator: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
        // fontSize: '18px'
    }),
    loadingMessage: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
        // fontSize: '18px'
    }),
    menu: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px',
        zIndex: '999999999999999',

        // fontSize: '18px'
    }),
    menuList: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px',
        width: '100%',
        // fontSize: '18px'
        zIndex: '999999999999999',

    }),
    menuPortal: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
        // fontSize: '18px'
    }),
    noOptionsMessage: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px'
        // fontSize: '18px'
    }),
    option: (provided, state) => ({
        ...provided,
        color: '#4285F4',
        backgroundColor: '#161C22',
        border: 'none',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        // fontSize: '18px'
        zIndex: '999999999999999',
    }),
    valueContainer: (provided, state) => ({
        ...provided,
        color: '#4285F4',
    }),
    singleValue: (provided, state) => ({
        ...provided,
        color: '#4285F4',
    }),
}