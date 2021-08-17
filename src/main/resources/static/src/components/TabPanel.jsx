import React from "react";
import Box from "@material-ui/core/Box";

class TabPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const {children, value, index, ...other} = this.props;
        return <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    }
}

export default TabPanel;