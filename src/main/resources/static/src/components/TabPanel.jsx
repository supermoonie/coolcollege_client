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
            style={{width: '100%', height: '100%'}}
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={0} style={{width: '100%', height: '100%'}}>
                    {children}
                </Box>
            )}
        </div>
    }
}

export default TabPanel;