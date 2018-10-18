import React, { Component } from 'react';
import { View,
        Animated,
        Text,
        PanResponder,
        Dimensions,
        LayoutAnimation
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIP_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

class Deck extends Component {
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {}
  }
  constructor(props) {

    super(props);

    const position = new Animated.ValueXY();
    //deal with the touch from the users to the card
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if( gesture.dx > SWIP_THRESHOLD){
          //right
          this.forceSwipe(SCREEN_WIDTH);
        } else if( gesture.dx < -SWIP_THRESHOLD) {
          //left
          this.forceSwipe(-SCREEN_WIDTH);
        } else {
          this.resetPosition();
        }
      }
    });
    this.state = { panResponder, position, index: 0 };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) this.setState({ index: 0 });
  }

  componentWillUpdate() {
    LayoutAnimation.spring();
  }
  //force the card to swipe right and get out of the creen
  forceSwipe(direction) {
    Animated.timing(this.state.position, {
      toValue: { x: direction, y: 0},
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }
  //deal with the swipe complete to change card
  onSwipeComplete(direction) {
    const { onSwipeRight, onSwipeLeft, data } = this.props;
    const item = data[this.props.item];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.state.position.setValue({ x: 0, y: 0}); //changing the card doesnt mean the position is reset automaticly
    this.setState({ index: this.state.index + 1});
  }
  //deal position to get back after the user stop dragging the card
  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  //deal with the rotation
  getCardStyle() {
    const { position } = this.state;
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-90deg', '0deg', '90deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  }

  renderCards(){
    if(this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if(i < this.state.index) { return null; }

      if(i === this.state.index) {
          return (
            <Animated.View
              key={item.id}
              style={[this.getCardStyle(), styles.cardStyle]}
              {...this.state.panResponder.panHandlers}
            >
              {this.props.renderCard(item)}
            </Animated.View>
          );
      }

        return (
          <Animated.View key={item.id} style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}>
            {this.props.renderCard(item)}
          </Animated.View>
        );
    }).reverse();
  }


  render() {
    return(
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position: 'absolute'
  }
}

export default Deck;
