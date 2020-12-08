import React, { useCallback } from 'react';
import { FlatList, Image, View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import { styles } from './credentials-search-list.styles';
import { CredentialsSearchListProps } from './credentials-search-list.props';
import { useFoundCredentials } from '../../redux/search';
import { useKeyExtractor } from '../../utils/hooks';
import { ICredentials, IFoundCredential } from '../../utils/types';
import { COLORS } from '../../utils/colors';
import { Text } from '../Text';
import { IMAGES } from '../../assets';

export const CredentialsSearchList: React.FC<CredentialsSearchListProps> = () => {
  const foundCredentials = useFoundCredentials();

  const renderItem = useCallback(
    ({ item, index }: { item: IFoundCredential; index: number }) => {
      const isFirst = index === 0;
      const isNotLast = index < foundCredentials.length - 1;

      return (
        <>
          <View
            style={[
              styles.foundCredentialContainer,
              isFirst ? styles.foundCredentialFirstContainer : null,
            ]}
          >
            <Image source={IMAGES.MAN} style={styles.foundCredentialImage} />
            <Text
              style={[
                styles.foundCredentialSubjectName,
                isFirst ? styles.foundCredentialSubjectNameFirst : null,
              ]}
            >
              {item.certificate.credentialSubject.name}
            </Text>
            <Text
              style={[
                styles.foundCredentialIssuerName,
                isFirst ? styles.foundCredentialIssuerNameFirst : null,
              ]}
            >
              {item.issuer.name}
            </Text>
          </View>
          {isNotLast ? <View style={styles.foundCredentialSeparator} /> : null}
        </>
      );
    },
    [],
  );

  const keyExtractor = useKeyExtractor<IFoundCredential>('credential-search');

  return foundCredentials.length ? (
    <FlatList
      data={foundCredentials}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    />
  ) : (
    <View style={styles.noResultsContainer}>
      <View style={styles.noResultsIconContainer}>
        <FontAwesomeIcon name="search" size={70} color={COLORS.SILVER} />
      </View>
      <Text style={styles.noResultsTitle}>No results</Text>
      <Text style={styles.noResultsSubtitle}>
        Change the request and try again
      </Text>
    </View>
  );
};
