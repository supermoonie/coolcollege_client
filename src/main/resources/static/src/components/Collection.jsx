import React from "react";
import {AppBar, Tab, Tabs, withStyles} from "@material-ui/core";
import TabPanel from "@/components/TabPanel";
import CourseList from "@/components/CourseList";
import ResourceList from "@/components/ResourceList";
import Container from "@material-ui/core/Container";

const styles = theme => ({
    container: {
        padding: 0,
        height: '100%',
        minHeight: '100%',
        width: '100%',
        minWidth: '100%'
    }
});

class Collection extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
        }
    }

    render() {
        const classes = this.props.classes;
        return <Container className={classes.container}>
            <AppBar position="fixed" color="default" style={{paddingLeft: 150}}>
                <Tabs value={this.state.activeTab}
                      indicatorColor="primary"
                      textColor="primary"
                      variant="fullWidth"
                      onChange={(event, value) => {
                          this.setState({
                              activeTab: value
                          })
                      }}>
                    <Tab label={"课程库"} id={"tab-0"} aria-details={"tab-panel-0"}/>
                    <Tab label={"素材库"} id={"tab-1"} aria-details={"tab-panel-1"}/>
                </Tabs>
            </AppBar>
            <TabPanel value={this.state.activeTab} index={0}>
                {
                    !!this.props.token ? <CourseList token={this.props.token} eid={this.props.eid} settings={this.props.settings}/> : null
                }
            </TabPanel>
            <TabPanel value={this.state.activeTab} index={1}>
                {
                    !!this.props.token ? <ResourceList token={this.props.token} eid={this.props.eid} settings={this.props.settings}/> : null
                }
            </TabPanel>
        </Container>
    }
}

export default withStyles(styles)(Collection);