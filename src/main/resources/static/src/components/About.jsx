import React from "react";
import {Container, withStyles} from "@material-ui/core";

const styles = theme => ({

});

class About extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return <React.Fragment>
            <Container>
                About
            </Container>
        </React.Fragment>
    }
}

export default withStyles(styles)(About);