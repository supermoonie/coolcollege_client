import React from "react";
import {Container, withStyles} from "@material-ui/core";

const styles = theme => ({

});

class DownloadManager extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return <React.Fragment>
            <Container>
                Download Manager
            </Container>
        </React.Fragment>
    }
}

export default withStyles(styles)(DownloadManager);