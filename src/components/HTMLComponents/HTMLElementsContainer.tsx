import React, {useCallback, useEffect, useRef} from 'react';
import MainPageContainer from "./Greetings/MainPageContainer";
import ProjectsContainer from "./Projects/ProjectsContainer";
import Interface from "./Interface/InterfaceContainer";
import styled from "styled-components/macro";
import {animated, useSpring} from "react-spring";
import {useDrag, useWheel} from 'react-use-gesture';
import {isMobile} from 'react-device-detect'
import {projectsInfo} from "../../textAndPrijectsInfo/TextAndProjectsSettings";
import ProjectsCounter from "./Interface/ProjectsCounter";
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {AppStateType} from "../../store/store";
import {actions} from "../../store/InterfaceReducer";
import InfoBlock from "./Interface/AboutMe/InfoBlock";
import CloseLook from "./Projects/CloseLook/ProjectCloseLook";
import {GEOMETRIES_TRANSITION_TO_MAIN_PAGE} from "../../utils/StringVariablesAndTypes";

const Wrapper = styled.div`
  position: absolute;
  z-index: 10;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: transparent;
`;

const ScrollableWrapper = styled(animated.div)`
  width: 100vw;
  position: absolute;
`;


const HTMLElementsContainer: React.FC = () => {

    const scrollsCount = useSelector((state: AppStateType) => state.interface.scrollsCount, shallowEqual);
    const project = useSelector((state: AppStateType) => state.interface.currentlyLookedProject, shallowEqual);
    const isInterfaceAvailable = useSelector((state: AppStateType) => state.interface.isInterfaceAvailable, shallowEqual);
    const isAboutMenuOpened = useSelector((state: AppStateType) => state.interface.isAboutMenuOpened, shallowEqual);
    const isMainPageFocused = useSelector((state: AppStateType) => state.interface.isMainPageFocused, shallowEqual);
    const druggingState = useSelector((state: AppStateType) => state.interface.druggingState, shallowEqual);
    const scrollingState = useSelector((state: AppStateType) => state.interface.scrollingState, shallowEqual);
    const loadedState = useSelector((state: AppStateType) => state.interface.loadedState, shallowEqual);
    const geometriesTransition = useSelector((state: AppStateType) => state.interface.geometriesTransition, shallowEqual);

    const dispatch = useDispatch();

    const wrapperRef = useRef<HTMLDivElement>(null);

    const [animation, setScroll] = useSpring(() => ({
        top: window.innerHeight,
        scale: 1,
        x: 0,
        config: {tension: 100, friction: 25, clamp: true},
    }));

    //resize
    const mutatedScrollsCount = useRef<number>(0);
    useEffect(() => {
        let isMounted = true;
        let timeoutId: number | undefined = undefined;
        const resizeListener = () => {
            if (isMounted) {
                clearTimeout(timeoutId);
                timeoutId = window.setTimeout(() => {
                    setScroll({
                        top: window.innerHeight * (1 - mutatedScrollsCount.current)
                    })
                }, 150);
            }
        };
        window.addEventListener('resize', resizeListener);
        return () => {
            isMounted = false;
            window.removeEventListener('resize', resizeListener);
        }
    }, [setScroll]);

    const onArrowClickHandler = useCallback(() => {
        dispatch(actions.transitionFromMainPaige())
    }, [dispatch]);

    useEffect(() => {
        if (!isInterfaceAvailable && !isMainPageFocused && scrollsCount !== 0) {
            setScroll({x: window.innerWidth})
        }
        if (isInterfaceAvailable && !isMainPageFocused && scrollsCount !== 0 && !isAboutMenuOpened && project === null) {
            setScroll({x: 0})
        }
        if (isInterfaceAvailable && !isMainPageFocused && scrollsCount === 0) {
            dispatch(actions.setScrollsCount(1))
            setScroll({
                top: 0,
            });
            setTimeout(() => dispatch(actions.stopScrolling()), 300)
        }
        if (geometriesTransition === GEOMETRIES_TRANSITION_TO_MAIN_PAGE) {
            setScroll({
                top: window.innerHeight,
            });
        }
        mutatedScrollsCount.current = scrollsCount
    }, [isInterfaceAvailable, isAboutMenuOpened, isMainPageFocused, setScroll, dispatch, scrollsCount, project, geometriesTransition]);

    useWheel(({direction: [, y]}) => {
        if (scrollingState || project !== null || isAboutMenuOpened || druggingState || !loadedState) return;
        if (y > 0 && scrollsCount < projectsInfo.length) {
            if (scrollsCount === 0) {
                dispatch(actions.transitionFromMainPaige());
            } else {
                dispatch(actions.startScrolling(true));
                setScroll({
                    top: -(scrollsCount + 1) * window.innerHeight + window.innerHeight,
                }).then(() => dispatch(actions.stopScrolling()))
            }
        }
        if (y < 0 && scrollsCount !== 0) {
            if (scrollsCount === 1) {
                dispatch(actions.transitionToMainPaige());
                setScroll({top: window.innerHeight})
            } else {
                dispatch(actions.startScrolling(false));
                setScroll({
                    top: -(scrollsCount - 1) * window.innerHeight + window.innerHeight,
                }).then(() => dispatch(actions.stopScrolling()))
            }
        }
    }, {domTarget: window});

    useDrag(({swipe: [, y]}) => {
        if (isMobile && y < 0 && document.fullscreenElement === null) document.documentElement.requestFullscreen();
        if (!isMobile || scrollingState || project !== null || isAboutMenuOpened || druggingState || !loadedState) return;
        if (y < 0 && scrollsCount < projectsInfo.length) {
            if (scrollsCount === 0) {
                dispatch(actions.transitionFromMainPaige());
            } else {
                dispatch(actions.startScrolling(true));
                setScroll({
                    top: -(scrollsCount + 1) * window.innerHeight + window.innerHeight,
                }).then(() => dispatch(actions.stopScrolling()))
            }
        }
        if (y > 0 && scrollsCount !== 0) {
            if (scrollsCount === 1) {
                dispatch(actions.transitionToMainPaige());
                setScroll({top: window.innerHeight})
            } else {
                dispatch(actions.startScrolling(false));
                setScroll({
                    top: -(scrollsCount - 1) * window.innerHeight + window.innerHeight,
                }).then(() => dispatch(actions.stopScrolling()))
            }
        }
    }, {domTarget: window, filterTaps: true});

    return (
        <Wrapper>
            <MainPageContainer onArrowClickHandler={onArrowClickHandler} isMainPageFocused={isMainPageFocused}
                               loadedState={loadedState}/>
            <ScrollableWrapper style={animation} ref={wrapperRef}>
                <ProjectsContainer/>
            </ScrollableWrapper>
            <Interface/>
            <ProjectsCounter setScroll={setScroll} scrollsCount={scrollsCount} isMainPageFocused={isMainPageFocused}
                             visible={isInterfaceAvailable && !isAboutMenuOpened && project === null}
                             isDrugging={druggingState}/>
            <InfoBlock visible={isAboutMenuOpened && isInterfaceAvailable}/>
            <CloseLook project={project} visible={!druggingState && !scrollingState && project !== null}/>
        </Wrapper>
    )
}

export default React.memo(HTMLElementsContainer)