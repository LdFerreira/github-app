import React, { Component } from 'react';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../services/api';

import {
  Form,
  Input,
  Container,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  ClearButton,
} from './styles';

export default class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  async componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  clearAsyncStorage = async () => {
    this.setState({ loading: true });
    AsyncStorage.clear();
    this.setState({
      users: [],
      newUser: '',
      loading: false,
    });
  };

  handleAddUser = async () => {
    const { users, newUser } = this.state;
    if (newUser !== '') {
      try {
        this.setState({ loading: true });
        const response = await api.get(`/users/${newUser}`);
        const data = {
          name: response.data.name,
          login: response.data.login,
          bio: response.data.bio,
          avatar: response.data.avatar_url,
        };

        this.setState({
          users: [...users, data],
          newUser: '',
          loading: false,
        });

        Keyboard.dismiss();
      } catch (error) {
        this.setState({
          newUser: '',
          loading: false,
        });
        alert('Usuario invalido, tente novamente!');
      }
    } else {
      alert('Insira um usuario por favor!');
    }
  };

  handleNavigate = user => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  };

  render() {
    const { users, newUser, loading } = this.state;
    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            value={newUser}
            placeholder="Adicione um usuário"
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
          <ClearButton loading={loading} onPress={this.clearAsyncStorage}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="block" size={20} color="#FFF" />
            )}
          </ClearButton>
        </Form>
        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <ProfileButton onPress={() => this.handleNavigate(item)}>
                <ProfileButtonText>Ver profile</ProfileButtonText>
              </ProfileButton>
            </User>
          )}
        />
      </Container>
    );
  }
}
