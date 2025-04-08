import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';

const Header = ({ 
  title, 
  subtitle,
  navigation, 
  backButton = false,
  onBackPress,
  backgroundColor,
  titleColor,
  subtitleColor,
  elevation = 4,
  rightActions = [],
  titleStyle = {},
  subtitleStyle = {},
  centerTitle = false
}) => {
  const theme = useTheme();
  
  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <Appbar.Header 
      style={[
        styles.header, 
        { 
          backgroundColor: backgroundColor || theme.colors.primary,
          elevation: elevation
        }
      ]}
    >
      {backButton && (
        <Appbar.BackAction onPress={handleBack} color={titleColor || 'white'} />
      )}
      
      <Appbar.Content 
        title={title} 
        subtitle={subtitle}
        titleStyle={[
          styles.title, 
          { color: titleColor || 'white', textAlign: centerTitle ? 'center' : 'left' },
          titleStyle
        ]}
        subtitleStyle={[
          styles.subtitle,
          { color: subtitleColor || 'rgba(255, 255, 255, 0.7)' },
          subtitleStyle
        ]}
        style={centerTitle ? { alignItems: 'center' } : {}}
      />
      
      {rightActions.map((action, index) => (
        <Appbar.Action
          key={index}
          icon={action.icon}
          color={action.color || titleColor || 'white'}
          onPress={action.onPress}
          disabled={action.disabled}
        />
      ))}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  }
});

export default Header;
