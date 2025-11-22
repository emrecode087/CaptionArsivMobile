import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export type CollectionsStackParamList = {
  CollectionsList: undefined;
  CollectionDetail: { id: string; name: string };
};

export type CollectionsScreenNavigationProp = NativeStackNavigationProp<
  CollectionsStackParamList,
  'CollectionsList'
>;

export type CollectionDetailScreenRouteProp = RouteProp<
  CollectionsStackParamList,
  'CollectionDetail'
>;
