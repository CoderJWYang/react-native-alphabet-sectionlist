'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactNative, {
  SectionList,
  StyleSheet,
  View,
  NativeModules,
  Text,
} from 'react-native';
import merge from 'merge';

import RightSectionList from './RightSectionList';

const { UIManager } = NativeModules;

export default class AlphabetSectionList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      offsetY: 0
    };

    this.renderFooter = this.renderFooter.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);

    this.onScroll = this.onScroll.bind(this);
    this.onScrollAnimationEnd = this.onScrollAnimationEnd.bind(this);
    this.scrollToSection = this.scrollToSection.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      UIManager.measure(ReactNative.findNodeHandle(this.refs.view), (x, y, w, h) => {
        this.containerHeight = h;
        if (this.props.contentInset && this.props.data && this.props.data.length > 0) {
          this.scrollToSection(Object.keys(this.props.data)[0]);
        }
      });
    }, 0);
  }

  scrollToSection(section) {
    let keys = Object.keys(this.props.data);
    if (typeof (this.props.compareFunction) === "function") {
      keys = keys.sort(this.props.compareFunction);
    }
    const index = keys.indexOf(section);

    this.refs.listview.scrollToLocation({ sectionIndex: index, itemIndex: 0, animated: true });

    this.props.onScrollToSection && this.props.onScrollToSection(section);
  }

  renderSectionHeader({ section: { title } }) {
    return (
      <View style={[styles.sectionHeader, this.props.sectionHeaderStyle]}>
        <Text style={this.props.sectionHeaderTextStyle}>{title}</Text>
      </View>
    )
  }

  renderFooter() {
    const Footer = this.props.footer;
    return <Footer />;
  }

  renderHeader() {
    const Header = this.props.header;
    return <Header />;
  }

  onScroll(e) {
    const offsetY = e.nativeEvent.contentOffset.y;
    if (this.props.updateScrollState) {
      this.setState({
        offsetY
      });
    }

    this.props.onScroll && this.props.onScroll(e);
  }

  onScrollAnimationEnd(e) {
    if (this.props.updateScrollState) {
      this.setState({
        offsetY: e.nativeEvent.contentOffset.y
      });
    }
  }

  render() {
    const { data } = this.props;
    let sectionList;
    let dataSource;
    let sections = Object.keys(data);

    if (typeof (this.props.compareFunction) === "function") {
      sections = sections.sort(this.props.compareFunction);
    }

    sectionList = !this.props.hideRightSectionList ?
      <RightSectionList
        style={this.props.rightSectionStyle}
        onSectionSelect={this.scrollToSection}
        sections={sections}
        data={data}
        getSectionListTitle={this.props.getRightSectionListTitle}
        component={this.props.rightSectionListItem}
        fontStyle={this.props.sectionListFontStyle}
      /> :
      null;

    dataSource = data;
    let sectionsListSections = [];
    for (let i = 0; i < sections.length; i++) {
      const alphabet = sections[i];
      const alphabetData = dataSource[alphabet];
      sectionsListSections.push({ title: alphabet, data: alphabetData });
    }

    const renderFooter = this.props.footer ?
      this.renderFooter :
      this.props.renderFooter;

    const renderHeader = this.props.header ?
      this.renderHeader :
      this.props.renderHeader;

    const renderSectionHeader = this.props.renderSectionHeader ?
      this.props.renderSectionHeader :
      this.renderSectionHeader;

    const props = merge({}, this.props, {
      onScroll: this.onScroll,
      onScrollAnimationEnd: this.onScrollAnimationEnd,
      sections: sectionsListSections,
      ListFooterComponent: renderFooter,
      ListHeaderComponent: renderHeader,
      renderSectionHeader: renderSectionHeader,
      renderItem: this.props.renderItem,
    });

    props.style = void 0;

    return (
      <View ref="view" style={[styles.container, this.props.style]}>
        <SectionList
          ref="listview"
          keyExtractor={(item, index) => item + index}
          {...props}
        />
        {sectionList}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  sectionHeader: {
    paddingLeft: 10,
    backgroundColor: '#f1f2f3',
  },
});

const stylesheetProp = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.object,
]);

AlphabetSectionList.propTypes = {
  /**
   * The data to render in the listview
   */
  data: PropTypes.object.isRequired,

  /**
   * A custom element to render for each list item
   */
  renderItem: PropTypes.func.isRequired,

  /**
   * A custom element to render for each list section
   */
  renderSectionHeader: PropTypes.func,

  /**
   * Whether to show the section listing or not
   */
  hideRightSectionList: PropTypes.bool,

  /**
   * Functions to provide a title for the section header and the section list
   * items. If not provided, the section ids will be used (the keys from the data object)
   */
  getRightSectionListTitle: PropTypes.func,

  /**
   * Function to sort sections. If not provided, the sections order will match data source
   */
  compareFunction: PropTypes.func,

  /**
   * Callback which should be called when the user scrolls to a section
   */
  onScrollToSection: PropTypes.func,

  /**
   * A custom element to render for right each section list item
   */
  rightSectionListItem: PropTypes.func,

  /**
   * A custom element to render as footer
   */
  footer: PropTypes.func,

  /**
   * A custom element to render as header
   */
  header: PropTypes.func,

  /**
   * A custom function to render as header
   */
  renderHeader: PropTypes.func,

  /**
   * A custom function to render as footer
   */
  renderFooter: PropTypes.func,

  /**
   * Whether to set the current y offset as state and pass it to each
   * cell during re-rendering
   */
  updateScrollState: PropTypes.bool,

  /**
   * Container style
   */
  style: stylesheetProp,

  /**
   * rightSection style
   */
  rightSectionStyle: stylesheetProp,

  /**
   * Right section font style
   */
  rightSectionFontStyle: stylesheetProp,

  /**
   * Default section header style
   */
  sectionHeaderStyle: stylesheetProp,

  /**
   * Default section header text style
   */
  sectionHeaderTextStyle: stylesheetProp,
};
