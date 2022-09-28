import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from '@emotion/styled';

const DEFAULT_TEXT =
  'あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。';
const CACHE_KEY = 'kanjiCountCache';

const Title = styled.h1((props) => {
  const { theme } = props;
  return {
    ...theme.typography.h1,
    color: theme.palette.text.primary,
  };
});

const Wrapper = styled.section((props) => {
  const { theme } = props;
  return {
    width: '400px',
    padding: '1em',
    background: theme.palette.background.primary,
  };
});

const TextArea = styled.textarea(() => {
  return {
    width: '100%',
    height: '300px',
  };
});

type ControlledTextAreaType = {
  defaultText: string;
  cacheKey?: string;
  className?: string;
};

const useControlledTextArea = ({
  defaultText,
  cacheKey,
  className,
}: ControlledTextAreaType) => {
  const [text, setText] = useState(defaultText);
  const handleType = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      setText(value);

      // manage cache
      if (cacheKey) {
        chrome.runtime.sendMessage({
          action: 'setCache',
          cacheKey,
          newValue: value,
        });
      }
    },
    [setText, cacheKey]
  );

  // manage cache
  useEffect(() => {
    chrome.runtime.sendMessage(
      { action: 'loadCache', cacheKey },
      ({ cache }) => {
        if (cache) {
          setText(cache);
        }
      }
    );
  }, [setText, cacheKey]);

  const textarea = (
    <TextArea
      onChange={handleType}
      value={text}
      className={className}
    ></TextArea>
  );

  return {
    text,
    setText,
    textarea,
  };
};

const useKanjiRate = (text: string) => {
  const regex = useMemo(() => {
    return /\p{scx=Han}/gu;
  }, []);
  const kanjiCount = useMemo(() => {
    return text.match(regex)?.length || 0;
  }, [text, regex]);

  return {
    textLength: text.length,
    kanjiCount,
    kanjiRate: kanjiCount / text.length || 0,
  };
};

export const Popup: FC = () => {
  const { text, textarea } = useControlledTextArea({
    defaultText: DEFAULT_TEXT,
    cacheKey: CACHE_KEY,
  });
  const { textLength, kanjiCount, kanjiRate } = useKanjiRate(text);
  const rateText = Math.round(kanjiRate * 1000) / 10;

  return (
    <Wrapper>
      <Title>Kanji Counter</Title>
      {textarea}
      <p>
        Count: {textLength} Kanji: {kanjiCount} Rate: {rateText} %
      </p>
    </Wrapper>
  );
};
