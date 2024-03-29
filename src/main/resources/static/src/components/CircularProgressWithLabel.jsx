import React from "react";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

class CircularProgressWithLabel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" {...this.props} />
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography variant="caption" component="div" color="textSecondary">{`${Math.round(
                        this.props.value,
                    )}%`}</Typography>
                </Box>
            </Box>
        );
    }
}

export default CircularProgressWithLabel;